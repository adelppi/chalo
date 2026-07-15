-- push_tokens: 端末ごとの Expo push token（docs/data-model.md）。
-- 作成通知（domain/notifications.md 1）をサーバから送るための送信先。

create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  expo_push_token text not null,
  updated_at timestamptz not null default now()
);

comment on table public.push_tokens is '端末ごとの Expo push token（docs/data-model.md）。作成通知の送信先。Edge Function からは service role で参照する。';
comment on column public.push_tokens.profile_id is 'トークンの持ち主。本人が退会したらトークンごと削除する（ON DELETE CASCADE）。';

-- 同じ端末（同じトークン）の再登録は upsert で1行に保つ。
create unique index if not exists push_tokens_expo_push_token_idx
  on public.push_tokens (expo_push_token);

create index if not exists push_tokens_profile_id_idx
  on public.push_tokens (profile_id);

create trigger push_tokens_set_updated_at
  before update on public.push_tokens
  for each row
  execute function public.set_updated_at();

alter table public.push_tokens enable row level security;

-- authenticated ロールへのテーブル権限（新規テーブルは既定で Data API に露出しないため明示的に付与）。
-- Edge Function は service role で参照するため RLS をバイパスする（anon には付与しない）。
grant select, insert, update, delete on public.push_tokens to authenticated;

-- 本人のみ自分のトークンを読み書きできる。他人（パートナー含む）のトークンは読ませない。
create policy "push_tokens_select_own"
  on public.push_tokens for select
  to authenticated
  using ((select auth.uid()) = profile_id);

create policy "push_tokens_insert_own"
  on public.push_tokens for insert
  to authenticated
  with check ((select auth.uid()) = profile_id);

create policy "push_tokens_update_own"
  on public.push_tokens for update
  to authenticated
  using ((select auth.uid()) = profile_id)
  with check ((select auth.uid()) = profile_id);

create policy "push_tokens_delete_own"
  on public.push_tokens for delete
  to authenticated
  using ((select auth.uid()) = profile_id);
