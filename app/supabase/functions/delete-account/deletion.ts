// アカウント削除の計算・判定ロジック（adr/0009・adr/0018）。
// 純粋関数のみを置き、Deno 依存を持たない（deletion.test.ts が Jest から import する。adr/0014）。

/** Apple トークン失効（App Store Guideline 5.1.1(v)）に必要な設定値 */
export type AppleRevokeConfig = {
  /** Apple Developer の Team ID */
  teamId: string;
  /** Sign in with Apple 用 Key の Key ID */
  keyId: string;
  /** .p8 秘密鍵の中身（PEM） */
  privateKey: string;
  /** ネイティブアプリの bundle id（ネイティブフローの client_id） */
  clientId: string;
};

/** auth.users の identities に Apple 連携が含まれるか */
export function hasAppleIdentity(
  identities: readonly { provider: string }[] | null | undefined,
): boolean {
  return (identities ?? []).some((identity) => identity.provider === "apple");
}

/** 失効に必要な環境変数が揃っていれば設定を、1つでも欠けていれば null を返す */
export function pickAppleRevokeConfig(
  env: Record<string, string | undefined>,
): AppleRevokeConfig | null {
  const teamId = env.APPLE_TEAM_ID;
  const keyId = env.APPLE_KEY_ID;
  const privateKey = env.APPLE_PRIVATE_KEY;
  const clientId = env.APPLE_CLIENT_ID;
  if (!teamId || !keyId || !privateKey || !clientId) {
    return null;
  }
  return { teamId, keyId, privateKey, clientId };
}

/**
 * 退会者が作ったプランのメモ末尾に追記する文言（domain/pairing.md「メモ末尾に元の作成者を追記」）。
 * このメモを読むのは残る側なので、名前は残る側のよびかたを優先し、未設定なら退会者の表示名を実名で残す。
 * 既存メモとの改行連結は delete_account_data（SQL）側が行う。
 */
export function buildDeletedOwnerAttribution(input: {
  /** 退会者の表示名（profiles 行が既に無い再試行時は null） */
  displayName: string | null;
  /** 残る側が設定していた「相手のよびかた」（未設定・ソロ退会なら null） */
  partnerNickname: string | null;
}): string {
  const name = input.partnerNickname?.trim() || input.displayName?.trim() || "";
  return name
    ? `（このプランは ${name}（削除済み）が作成）`
    : "（このプランは 削除済みのユーザーが作成）";
}
