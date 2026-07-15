-- 作成通知（domain/notifications.md 1・adr/0007 系統2）：
-- プラン INSERT をトリガに Edge Function（notify-plan-created）を起動し、
-- パートナー（作成者以外）の端末へ Expo Push で即時送信する。
-- 送信は pg_net で非同期に行い、INSERT トランザクションをブロックしない。

create extension if not exists pg_net with schema net;

-- Edge Function の URL・呼び出し用キーは Vault に保存する（値は migration に含めない。
-- `select vault.create_secret(value, name)` を運用で別途実行する）。
create or replace function public.notify_plan_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_url text;
  v_anon_key text;
begin
  if new.pair_id is null then
    -- ソロ（未ペア）。送る相手がいない。
    return new;
  end if;

  select decrypted_secret into v_url
    from vault.decrypted_secrets where name = 'edge_function_url';
  select decrypted_secret into v_anon_key
    from vault.decrypted_secrets where name = 'edge_function_anon_key';

  if v_url is null or v_anon_key is null then
    raise warning 'notify_plan_created: Vault に edge_function_url / edge_function_anon_key が未設定です';
    return new;
  end if;

  perform net.http_post(
    url := v_url || '/functions/v1/notify-plan-created',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_anon_key
    ),
    body := jsonb_build_object(
      'plan_id', new.id,
      'pair_id', new.pair_id,
      'owner_id', new.owner_id,
      'title', new.title
    )
  );

  return new;
exception when others then
  -- 通知の送信準備の失敗でプラン作成自体を失敗させない（non-functional.md「サーバ側 push の送信失敗はユーザーに見せない」）。
  raise warning 'notify_plan_created failed: %', sqlerrm;
  return new;
end;
$$;

create trigger plans_notify_created
  after insert on public.plans
  for each row
  execute function public.notify_plan_created();
