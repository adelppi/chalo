-- アカウント削除の DB 側処理（adr/0009・adr/0018）:
-- 退会者を指す FK の付け替え・削除を1トランザクション（この関数の呼び出し）で行う。
-- auth.users の削除は Edge Function（delete-account）が service role で
-- supabase.auth.admin.deleteUser() を呼び、profiles 行はその ON DELETE CASCADE で消える。
-- この関数はその直前の前処理として実行する（実行順序は adr/0018）。
create or replace function public.delete_account_data(
  p_profile_id uuid,
  p_attribution text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pair_id uuid;
  v_partner_id uuid;
begin
  select pair_id into v_pair_id
    from public.profiles where id = p_profile_id;
  if not found then
    -- 既に削除済み（前回試行の途中失敗後の再試行など）。何もしない。
    return;
  end if;

  if v_pair_id is not null then
    select id into v_partner_id
      from public.profiles
      where pair_id = v_pair_id and id <> p_profile_id;
  end if;

  if v_pair_id is null then
    -- ソロ利用中の自己削除: 付け替え先が存在しないため、本人のプランも完全削除する。
    delete from public.plans where owner_id = p_profile_id;
  elsif v_partner_id is null then
    -- 相手は削除済み（自分はロック状態の残った側）:
    -- 残っていた共有プランと pairs 行もまとめて削除する（domain/pairing.md「全データの消去」）。
    delete from public.plans where pair_id = v_pair_id;
    update public.profiles set pair_id = null where id = p_profile_id;
    delete from public.pairs where id = v_pair_id;
  else
    -- 相手が残る通常ケース: 共有プランは消さず、退会者を指す参照を付け替える。
    -- 1) 退会者が作ったプランはメモ末尾に元の作成者を追記（文言は Edge Function が組み立てて渡す）
    update public.plans
      set memo = case
        when memo is null or memo = '' then p_attribution
        else memo || E'\n' || p_attribution
      end
      where owner_id = p_profile_id;
    -- 2) owner_id を残った側へ付け替え（NOT NULL 維持）
    update public.plans set owner_id = v_partner_id
      where owner_id = p_profile_id;
    -- 3) 退会者が保持していた編集ロックをクリア
    update public.plans set locked_by = null, locked_at = null
      where locked_by = p_profile_id;
  end if;

  -- 退会者の招待コード・push token は削除（他人に付け替えない。data-model.md）。
  delete from public.invites where inviter_id = p_profile_id;
  delete from public.push_tokens where profile_id = p_profile_id;
end;
$$;

comment on function public.delete_account_data(uuid, text) is
  'アカウント削除の前処理。退会者を指す FK の付け替え・削除を1トランザクションで実行する（adr/0018）。Edge Function delete-account から service role で呼ぶ。';

-- service role（Edge Function delete-account）専用。
-- 関数作成時の既定 EXECUTE（PUBLIC）とプロジェクトのデフォルト権限を剥奪する（adr/0017 の落とし穴と同じ対処）。
revoke execute on function public.delete_account_data(uuid, text) from public;
revoke execute on function public.delete_account_data(uuid, text) from anon;
revoke execute on function public.delete_account_data(uuid, text) from authenticated;
grant execute on function public.delete_account_data(uuid, text) to service_role;
