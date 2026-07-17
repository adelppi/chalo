-- bug_reports の grant を絞る（Issue #51）。
-- テーブル作成時に public スキーマの既定権限（default privileges）で
-- anon / authenticated へ広い grant が付くため、「本人の insert 専用・
-- 閲覧はサポート（service role）のみ」（data-model.md）まで絞り直す。
-- select ポリシーは無いため RLS でも読めないが、grant 自体も残さない。

revoke all on public.bug_reports from anon;
revoke all on public.bug_reports from authenticated;
grant insert on public.bug_reports to authenticated;
