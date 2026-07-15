// 作成通知（domain/notifications.md 1）の送信対象・ペイロード決定ロジック。
// 純粋関数（adr/0014）。Deno（index.ts）と Jest の両方から読み込む。
// Deno 固有 API には依存しない、プレーンな TypeScript のみを置く。

export type PairMember = {
  id: string;
  displayName: string;
};

/** ペアの2人から作成者以外（＝パートナー）を選ぶ。ペア未成立なら null */
export function pickPartner(
  members: PairMember[],
  creatorId: string,
): PairMember | null {
  return members.find((member) => member.id !== creatorId) ?? null;
}

export type ExpoPushMessage = {
  to: string[];
  title: string;
  body: string;
  data: { url: string };
  sound: "default";
};

/** パートナーの端末トークンが無ければ null（送るものが無い） */
export function buildCreationPushMessage(input: {
  tokens: string[];
  creatorName: string;
  planTitle: string;
  planId: string;
}): ExpoPushMessage | null {
  if (input.tokens.length === 0) {
    return null;
  }
  return {
    to: input.tokens,
    title: `${input.creatorName}がプランを追加しました🐾`,
    body: input.planTitle,
    // タップ遷移（useNotificationObserver・extractNotificationUrl）が読む形に揃える。
    data: { url: `/plan/${input.planId}` },
    sound: "default",
  };
}

export type ExpoPushTicket = {
  status: "ok" | "error";
  message?: string;
};

/** Expo Push API のレスポンス（tickets）からエラーだけを抽出する（ログ用） */
export function collectPushErrors(tickets: ExpoPushTicket[]): string[] {
  return tickets
    .filter((ticket) => ticket.status === "error")
    .map((ticket) => ticket.message ?? "unknown error");
}
