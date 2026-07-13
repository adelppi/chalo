import type { RedeemErrorReason } from "./types";

// 招待コードまわりの計算・判定。純粋関数（adr/0014）。

/** 6桁の数字か */
export function isValidCodeFormat(code: string): boolean {
  return /^\d{6}$/.test(code);
}

/** 「あと 23時間 つかえます」（B-2・E-1b）。切れていれば null */
export function formatRemainingLabel(
  expiresAt: string,
  now: Date,
): string | null {
  const remainingMs = new Date(expiresAt).getTime() - now.getTime();
  if (remainingMs <= 0) {
    return null;
  }
  const hours = Math.max(1, Math.ceil(remainingMs / (60 * 60 * 1000)));
  return `あと ${hours}時間 つかえます`;
}

/** F-3 招待コードのエラーメッセージ */
export function redeemErrorMessage(reason: RedeemErrorReason): string {
  switch (reason) {
    case "not-found":
      return "コードが見つかりません。もういちど確かめてください。";
    case "expired":
      return "このコードは期限が切れています。新しいコードをもらってください。";
    case "own-code":
      return "自分でつくったコードは使えません。相手の画面で入力してもらいましょう。";
    case "already-paired":
      return "すでにペアになっています。設定からペアを確認できます。";
  }
}

// redeem_invite_code() RPC（Postgres）が raise するメッセージ →
// RedeemErrorReason のマッピング（Issue #20）。RPC 側の文言と1対1で対応させる。
const RPC_ERROR_MESSAGE_TO_REASON: Record<string, RedeemErrorReason> = {
  invite_not_found: "not-found",
  invite_expired: "expired",
  invite_own_code: "own-code",
  already_paired: "already-paired",
};

/** RPC のエラーメッセージを RedeemErrorReason にマップする。既知の種別でなければ null */
export function mapRedeemErrorReason(
  message: string,
): RedeemErrorReason | null {
  return RPC_ERROR_MESSAGE_TO_REASON[message] ?? null;
}
