// アカウント削除（domain/pairing.md「ペア解除と退会」・adr/0009・adr/0018）。
// クライアント（supabaseAuthRepository.deleteAccount）から本人の JWT 付きで呼ばれる。
// 1) Apple 連携ユーザーは Apple トークンを失効（ベストエフォート。失敗しても削除は続行）
// 2) delete_account_data()（1トランザクション）で退会者を指す FK を付け替え・削除
// 3) service role の auth.admin.deleteUser() で auth.users を削除
//    （profiles 行は ON DELETE CASCADE で消える）
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { importPKCS8, SignJWT } from "npm:jose@5";

import {
  type AppleRevokeConfig,
  buildDeletedOwnerAttribution,
  hasAppleIdentity,
  pickAppleRevokeConfig,
} from "./deletion.ts";

const APPLE_TOKEN_URL = "https://appleid.apple.com/auth/token";
const APPLE_REVOKE_URL = "https://appleid.apple.com/auth/revoke";

// Apple のクライアントシークレット（ES256 で署名した短命 JWT）を組み立てる。
async function buildAppleClientSecret(
  config: AppleRevokeConfig,
): Promise<string> {
  const key = await importPKCS8(config.privateKey, "ES256");
  return await new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: config.keyId })
    .setIssuer(config.teamId)
    .setIssuedAt()
    .setExpirationTime("5m")
    .setAudience("https://appleid.apple.com")
    .setSubject(config.clientId)
    .sign(key);
}

// authorization code を refresh token に交換してから失効する。
// code はクライアントが削除直前の再認証（signInAsync）で取得した値（有効期限5分・1回きり）。
async function revokeAppleToken(
  config: AppleRevokeConfig,
  authorizationCode: string,
): Promise<void> {
  const clientSecret = await buildAppleClientSecret(config);

  const tokenResponse = await fetch(APPLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: clientSecret,
      code: authorizationCode,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenResponse.ok) {
    throw new Error(
      `Apple のトークン交換に失敗しました（${tokenResponse.status}）`,
    );
  }
  const tokenJson = await tokenResponse.json();
  const refreshToken = tokenJson.refresh_token;
  if (typeof refreshToken !== "string" || refreshToken.length === 0) {
    throw new Error("Apple のトークン交換の応答に refresh_token がありません");
  }

  const revokeResponse = await fetch(APPLE_REVOKE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: clientSecret,
      token: refreshToken,
      token_type_hint: "refresh_token",
    }),
  });
  if (!revokeResponse.ok) {
    throw new Error(
      `Apple トークンの失効に失敗しました（${revokeResponse.status}）`,
    );
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("method not allowed", { status: 405 });
  }

  // 削除対象は常に「呼び出し元本人」。JWT からユーザーを特定し、body からは受け取らない
  // （他人のアカウントを削除できないことの担保。Issue #34）。
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response("unauthorized", { status: 401 });
  }
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    },
  );
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return new Response("unauthorized", { status: 401 });
  }
  const user = userData.user;

  let body: { apple_authorization_code?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    // body なし（Google ユーザー等）も許容する。
  }
  const appleAuthorizationCode =
    typeof body.apple_authorization_code === "string" &&
    body.apple_authorization_code.length > 0
      ? body.apple_authorization_code
      : null;

  // Apple 連携ユーザーはトークンを失効する（App Store Guideline 5.1.1(v)）。
  // 失効の失敗でアプリ内の削除自体を止めない（ベストエフォート。方針は adr/0018）。
  if (hasAppleIdentity(user.identities)) {
    const config = pickAppleRevokeConfig(Deno.env.toObject());
    if (!config) {
      console.error(
        "delete-account: Apple 失効用のシークレット（APPLE_TEAM_ID / APPLE_KEY_ID / APPLE_PRIVATE_KEY / APPLE_CLIENT_ID）が未設定です",
      );
    } else if (!appleAuthorizationCode) {
      console.error(
        "delete-account: Apple ユーザーですが apple_authorization_code がリクエストにありません",
      );
    } else {
      try {
        await revokeAppleToken(config, appleAuthorizationCode);
      } catch (error) {
        console.error("delete-account: Apple トークンの失効に失敗しました", error);
      }
    }
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  // メモ追記の文言用に表示名を読む（profiles が既に無い再試行時は null）。
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) {
    console.error("delete-account: profiles の取得に失敗しました", profileError);
    return new Response("internal error", { status: 500 });
  }

  // 退会者を指す FK の付け替え・削除（1トランザクション。adr/0018）。
  const { error: dataError } = await admin.rpc("delete_account_data", {
    p_profile_id: user.id,
    p_attribution: buildDeletedOwnerAttribution(profile?.display_name ?? ""),
  });
  if (dataError) {
    console.error(
      "delete-account: delete_account_data の実行に失敗しました",
      dataError,
    );
    return new Response("internal error", { status: 500 });
  }

  // auth.users を削除（profiles は ON DELETE CASCADE で連動して消える）。
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error("delete-account: auth ユーザーの削除に失敗しました", deleteError);
    return new Response("internal error", { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
