// 表示名の事前入力に関する純粋関数（adr/0014: 判定ロジックは純粋関数に切り出して Jest でテストする）。

const FALLBACK_DISPLAY_NAME = "ユーザー";

// Apple「メールを非公開」のリレーアドレスのドメイン。
// ローカル部がランダム文字列（例: ghwjh7mpmd）で表示名として意味がないため、
// フォールバックには使わない。
const APPLE_PRIVATE_RELAY_DOMAIN = "privaterelay.appleid.com";

// Apple の氏名（givenName / familyName）を1つの表示名に整形する。
// 日本語圏では姓→名が自然なため familyName を先にする。両方空なら null。
export function formatAppleFullName(
  fullName:
    | { givenName?: string | null; familyName?: string | null }
    | null
    | undefined,
): string | null {
  if (!fullName) {
    return null;
  }

  const parts = [fullName.familyName, fullName.givenName]
    .map((part) => part?.trim())
    .filter((part): part is string => !!part);

  return parts.length > 0 ? parts.join(" ") : null;
}

// サインイン後の表示名を決める。
// 優先順: プロバイダの氏名ヒント → メールのローカル部 → 既定値。
export function resolveDisplayName(input: {
  nameHint: string | null | undefined;
  email: string | null | undefined;
}): string {
  const name = input.nameHint?.trim();
  if (name) {
    return name;
  }

  const [localPart, domain] = input.email?.trim().split("@") ?? [];
  if (
    localPart?.trim() &&
    domain?.toLowerCase() !== APPLE_PRIVATE_RELAY_DOMAIN
  ) {
    return localPart.trim();
  }

  return FALLBACK_DISPLAY_NAME;
}
