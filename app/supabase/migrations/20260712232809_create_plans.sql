-- plans: 「いつか一緒に行きたい所・やりたい事」のプラン本体。
-- 定義は docs/data-model.md の plans テーブルに従う。
-- 注意:
--   * status 列は持たない（closed_at と date から完全導出。docs/domain/plan-lifecycle.md）。
--   * pair_id の pairs への外部キーは pairs テーブル作成時に別 Issue で追加する。
--   * locked_by / locked_at は列のみ用意し、取得・解放の挙動は別 Issue（adr/0005）。
--   * RLS はソロ最小（owner_id 本人のみ）。同じ pair_id のメンバーへ開放する
--     ペア境界 RLS は別 Issue（RLS 一括実装）で追加する。

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid,
  owner_id uuid not null references public.profiles (id),
  title text not null,
  date date,
  time time,
  deadline date,
  place_name text,
  place_lat double precision,
  place_lng double precision,
  reference_url text,
  memo text,
  closed_at date,
  locked_by uuid references public.profiles (id) on delete set null,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.plans is 'プラン本体（docs/data-model.md）。status 列は持たず closed_at と date から導出する。';
comment on column public.plans.pair_id is '共有プールの所属。ソロ時は null。pairs テーブル作成時に外部キーを追加する（別 Issue）。';
comment on column public.plans.owner_id is '所有者 兼 作成者。ソロ時の RLS 境界にも使う。';
comment on column public.plans.closed_at is '手動おしまいの日。自動おしまいは書き込まない（読み取り時に導出）。';

-- RLS（owner_id = auth.uid()）と owner_id での絞り込みを速くする index。
create index if not exists plans_owner_id_idx on public.plans (owner_id);

-- updated_at を更新のたびに自動で進める（同期・last-write-wins 判定用）。
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger plans_set_updated_at
  before update on public.plans
  for each row
  execute function public.set_updated_at();

alter table public.plans enable row level security;

-- authenticated ロールへのテーブル権限（新規テーブルは既定で Data API に露出しないため明示的に付与）。
-- 行レベルの絞り込みは下の RLS ポリシーが担う。anon には付与しない。
grant select, insert, update, delete on public.plans to authenticated;

-- ソロ最小ポリシー：owner_id 本人のみ読み書きできる。
create policy "plans_select_own"
  on public.plans for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "plans_insert_own"
  on public.plans for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "plans_update_own"
  on public.plans for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "plans_delete_own"
  on public.plans for delete
  to authenticated
  using ((select auth.uid()) = owner_id);
