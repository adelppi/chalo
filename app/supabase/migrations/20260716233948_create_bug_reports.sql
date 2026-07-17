-- bug_reports: 不具合報告 / ログ送信（docs/data-model.md・adr/0011）。
-- 設定の「ログを送信」で端末内 NDJSON ログを受け取る。送信1回で1行。

create table if not exists public.bug_reports (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  comment text,
  logs text not null,
  app_version text not null,
  os_version text not null,
  device_model text not null,
  created_at timestamptz not null default now()
);

comment on table public.bug_reports is '不具合報告 / ログ送信（docs/data-model.md）。送信1回で1行。閲覧はサポート（service role）のみで、アプリからは insert 専用。';
comment on column public.bug_reports.profile_id is '送信者。本人が退会したらレポートごと削除する（ON DELETE CASCADE）。';
comment on column public.bug_reports.comment is '送信時に添えた症状（任意入力）。';
comment on column public.bug_reports.logs is '端末の NDJSON をそのまま格納（送信時点で端末にあった分、最大30日 / 2MB）。';

-- 退会時の CASCADE 削除（delete_account_data）で参照される
create index if not exists bug_reports_profile_id_idx
  on public.bug_reports (profile_id);

alter table public.bug_reports enable row level security;

-- 本人の insert 専用。select / update / delete は grant しない（パートナー含め
-- 誰も読めない）。閲覧はサポートが service role で行い RLS をバイパスする。
-- anon には何も付与しない。
grant insert on public.bug_reports to authenticated;

create policy "bug_reports_insert_own"
  on public.bug_reports for insert
  to authenticated
  with check ((select auth.uid()) = profile_id);
