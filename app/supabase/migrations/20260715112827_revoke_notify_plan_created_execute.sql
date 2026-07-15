-- notify_plan_created() はトリガー専用（public.plans への INSERT からのみ呼ばれる）。
-- トリガー発火は呼び出し元ロールの EXECUTE 権限を必要としないため、直接呼び出しの
-- 経路だけを閉じる（advisor: anon/authenticated_security_definer_function_executable）。
revoke execute on function public.notify_plan_created() from public;
