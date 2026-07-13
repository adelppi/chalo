-- Postgres は関数作成時に既定で PUBLIC（anon 含む）へ EXECUTE を付与するため、
-- authenticated 専用にする（Supabase advisor: anon_security_definer_function_executable）。
revoke all on function public.current_pair_id() from public;
revoke all on function public.redeem_invite_code(text) from public;

grant execute on function public.current_pair_id() to authenticated;
grant execute on function public.redeem_invite_code(text) to authenticated;
