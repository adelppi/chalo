-- Supabase のデフォルト権限設定で新規関数は anon にも自動で EXECUTE が付与されるため、
-- anon ロールから明示的に剥奪する（前の migration の revoke from public だけでは足りなかった）。
revoke execute on function public.current_pair_id() from anon;
revoke execute on function public.redeem_invite_code(text) from anon;
