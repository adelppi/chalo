-- Supabase はプロジェクトの既定権限で新規関数に anon/authenticated への EXECUTE を
-- 自動付与する（adr/0017 の落とし穴と同じ）。PUBLIC からの revoke だけでは効かないため、
-- anon・authenticated から個別に revoke する。notify_plan_created() はトリガー専用。
revoke execute on function public.notify_plan_created() from anon;
revoke execute on function public.notify_plan_created() from authenticated;
