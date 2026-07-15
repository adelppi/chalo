// 作成通知（domain/notifications.md 1・adr/0007 系統2）。
// public.plans への INSERT トリガ（notify_plan_created()）から pg_net 経由で呼ばれる。
// 作成者以外＝パートナーの push_tokens 宛に Expo Push を送る。束ねない・作成者本人には送らない。
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

import {
  buildCreationPushMessage,
  collectPushErrors,
  pickPartner,
} from "./creationPush.ts";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const SEND_ATTEMPTS = 3;

type TriggerPayload = {
  plan_id?: string;
  pair_id?: string;
  owner_id?: string;
  title?: string;
};

async function sendExpoPush(message: unknown): Promise<void> {
  const expoAccessToken = Deno.env.get("EXPO_ACCESS_TOKEN");
  const response = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(expoAccessToken
        ? { Authorization: `Bearer ${expoAccessToken}` }
        : {}),
    },
    body: JSON.stringify([message]),
  });
  if (!response.ok) {
    throw new Error(`Expo Push API から ${response.status} が返りました`);
  }
  const json = await response.json();
  const errors = collectPushErrors(json.data ?? []);
  if (errors.length > 0) {
    // 一部のトークンへの送信失敗。ユーザーには見せず、ログのみ（non-functional.md）。
    console.error("作成通知の送信に一部失敗しました", errors);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("method not allowed", { status: 405 });
  }

  let payload: TriggerPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response("invalid json", { status: 400 });
  }

  const { plan_id: planId, pair_id: pairId, owner_id: ownerId, title } =
    payload;
  if (!planId || !pairId || !ownerId || !title) {
    return new Response("missing fields", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { data: members, error: profilesError } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("pair_id", pairId);
  if (profilesError) {
    console.error("プロフィールの取得に失敗しました", profilesError);
    return new Response("internal error", { status: 500 });
  }

  const creator = (members ?? []).find((member) => member.id === ownerId);
  const partner = pickPartner(
    (members ?? []).map((member) => ({
      id: member.id,
      displayName: member.display_name,
    })),
    ownerId,
  );
  if (!partner) {
    // ペア未成立・解消済みなど、送る相手がいない。
    return new Response("no partner", { status: 200 });
  }

  const { data: tokenRows, error: tokensError } = await supabase
    .from("push_tokens")
    .select("expo_push_token")
    .eq("profile_id", partner.id);
  if (tokensError) {
    console.error("push_tokens の取得に失敗しました", tokensError);
    return new Response("internal error", { status: 500 });
  }

  const message = buildCreationPushMessage({
    tokens: (tokenRows ?? []).map((row) => row.expo_push_token),
    creatorName: creator?.display_name ?? "相手",
    planTitle: title,
    planId,
  });
  if (!message) {
    // パートナーの端末にトークン登録が無い。
    return new Response("no tokens", { status: 200 });
  }

  for (let attempt = 1; attempt <= SEND_ATTEMPTS; attempt++) {
    try {
      await sendExpoPush(message);
      break;
    } catch (error) {
      console.error(
        `作成通知の送信に失敗しました（試行${attempt}/${SEND_ATTEMPTS}）`,
        error,
      );
      if (attempt < SEND_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
      // 最終試行後もユーザーには見せない。ログのみ（non-functional.md）。
    }
  }

  return new Response("ok", { status: 200 });
});
