-- pairs / invites: ペア成立まわりのテーブルと RPC・RLS。
-- 定義は docs/data-model.md の pairs・invites テーブル、docs/domain/pairing.md の成立ルールに従う。
-- 注意:
--   * ペア成立は Postgres RPC（SECURITY DEFINER）で1トランザクションとして実行する。
--   * plans/profiles の pair 境界 RLS もここで導入する（#18 で先送りしていた分）。

create table if not exists public.pairs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

comment on table public.pairs is '1対1のペア（docs/data-model.md）。メンバーは profiles.pair_id で表現する。';

create table if not exists public.invites (
  code text primary key,
  inviter_id uuid not null references public.profiles (id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.invites is '招待コード（docs/data-model.md）。6桁数字・発行から24時間・1回使用。再発行で旧コードは失効する。';

create index if not exists invites_inviter_id_idx on public.invites (inviter_id);

-- 先送りしていた FK を追加する（#18 の注記）。
alter table public.profiles
  add constraint profiles_pair_id_fkey foreign key (pair_id) references public.pairs (id);

alter table public.plans
  add constraint plans_pair_id_fkey foreign key (pair_id) references public.pairs (id);

comment on column public.profiles.pair_id is '所属するペア。未ペアなら null。';
comment on column public.plans.pair_id is '共有プールの所属。ソロ時は null。ペア成立時に redeem_invite_code() が付与する。';

-- 新規プランの pair_id 自動付与。
-- ソロ→ペアの既存プラン合流は redeem_invite_code() が担うが、
-- ペア成立後に新規作成するプランにも全共有（domain/pairing.md）のため pair_id を付ける必要がある。
create or replace function public.set_plan_pair_id()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.pair_id is null then
    select pair_id into new.pair_id from public.profiles where id = new.owner_id;
  end if;
  return new;
end;
$$;

create trigger plans_set_pair_id
  before insert on public.plans
  for each row
  execute function public.set_plan_pair_id();

-- 現在ユーザーの pair_id を返すヘルパ。
-- SECURITY DEFINER にすることで、これを使う profiles の RLS ポリシーが
-- profiles 自身の RLS を再帰的に誘発しないようにする（Issue #20 補足）。
create or replace function public.current_pair_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select pair_id from public.profiles where id = auth.uid();
$$;

grant execute on function public.current_pair_id() to authenticated;

-- plans: ペア境界の select/update/delete を追加する。
-- 既存のソロ境界ポリシー（owner_id 本人のみ）はそのまま残す。
-- 同じコマンドの permissive ポリシーは OR で合成されるため、
-- 「本人の行」または「同じペアの行」のどちらかに一致すればアクセスできる。
create policy "plans_select_pair"
  on public.plans for select
  to authenticated
  using (pair_id is not null and pair_id = public.current_pair_id());

create policy "plans_update_pair"
  on public.plans for update
  to authenticated
  using (pair_id is not null and pair_id = public.current_pair_id())
  with check (pair_id is not null and pair_id = public.current_pair_id());

create policy "plans_delete_pair"
  on public.plans for delete
  to authenticated
  using (pair_id is not null and pair_id = public.current_pair_id());

-- profiles: 同じペアの相手を参照可（相手の表示名取得のため）。
create policy "profiles_select_partner"
  on public.profiles for select
  to authenticated
  using (pair_id is not null and pair_id = public.current_pair_id());

-- pairs: メンバーのみ read 可。書き込みは redeem_invite_code() の SECURITY DEFINER 経由のみ
-- （authenticated には insert/update/delete を grant しない）。
alter table public.pairs enable row level security;
grant select on public.pairs to authenticated;

create policy "pairs_select_member"
  on public.pairs for select
  to authenticated
  using (id = public.current_pair_id());

-- invites: 発行者本人のみ read/insert/delete。redeem は RPC 経由で RLS を跨ぐ
-- （一般 SELECT で他人の invites を読ませない）。
alter table public.invites enable row level security;
grant select, insert, delete on public.invites to authenticated;

create policy "invites_select_own"
  on public.invites for select
  to authenticated
  using ((select auth.uid()) = inviter_id);

create policy "invites_insert_own"
  on public.invites for insert
  to authenticated
  with check ((select auth.uid()) = inviter_id);

create policy "invites_delete_own"
  on public.invites for delete
  to authenticated
  using ((select auth.uid()) = inviter_id);

-- ペア成立 RPC：コード検証 → pairs 作成 → 両者の profiles.pair_id 付与 →
-- 両者のソロプランへ pair_id 付与、を1トランザクションで実行する。
-- エラーは reason ごとに区別できるメッセージを raise する
-- （supabasePairingRepository が RedeemErrorReason にマップする）。
create or replace function public.redeem_invite_code(p_code text)
returns table (partner_id uuid, partner_name text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller_id uuid := auth.uid();
  v_caller_pair_id uuid;
  v_invite public.invites%rowtype;
  v_inviter_pair_id uuid;
  v_pair_id uuid;
begin
  if v_caller_id is null then
    raise exception 'not_authenticated';
  end if;

  select pair_id into v_caller_pair_id from public.profiles where id = v_caller_id;
  if v_caller_pair_id is not null then
    raise exception 'already_paired';
  end if;

  select * into v_invite from public.invites where code = p_code for update;
  if not found then
    raise exception 'invite_not_found';
  end if;

  if v_invite.inviter_id = v_caller_id then
    raise exception 'invite_own_code';
  end if;

  if v_invite.used_at is not null or v_invite.expires_at <= now() then
    raise exception 'invite_expired';
  end if;

  select pair_id into v_inviter_pair_id from public.profiles where id = v_invite.inviter_id;
  if v_inviter_pair_id is not null then
    -- 発行者が別経路で既にペア済み（本来は再発行で失効するはずの取りこぼし）。
    -- コード自体は無効という扱いで not-found に寄せる。
    raise exception 'invite_not_found';
  end if;

  insert into public.pairs default values returning id into v_pair_id;

  update public.profiles set pair_id = v_pair_id
    where id in (v_invite.inviter_id, v_caller_id);

  update public.plans set pair_id = v_pair_id
    where pair_id is null and owner_id in (v_invite.inviter_id, v_caller_id);

  update public.invites set used_at = now() where code = p_code;

  return query
    select p.id, p.display_name from public.profiles p where p.id = v_invite.inviter_id;
end;
$$;

grant execute on function public.redeem_invite_code(text) to authenticated;
