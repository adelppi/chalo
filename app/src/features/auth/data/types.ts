// auth feature のドメイン型（DB 行ではなく data-model.md のドメイン表現）。
// ライブラリ非依存。Supabase 実装（global/data）はこの契約に合わせてマッピングする（adr/0003）。

export type AuthUser = {
  id: string;
  email: string | null;
};

export type AuthSession = {
  user: AuthUser;
};

// プロバイダから受け取った、プロフィール事前入力用の生データ。
// 表示名の決定は feature の純粋関数（model）が行うため、ここでは加工しない。
export type ProviderIdentity = {
  email: string | null;
  // Google 等: user_metadata の full_name / name。
  fullName: string | null;
  // Apple: 氏名（初回サインイン時のみ返る）。
  appleFullName: { givenName: string | null; familyName: string | null } | null;
  avatarUrl: string | null;
};

export type SignInResult = {
  session: AuthSession;
  identity: ProviderIdentity;
};

export type Profile = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  partnerNickname: string | null;
  pairId: string | null;
  timezone: string;
  createdAt: string;
};

export type EnsureProfileInput = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  timezone: string;
};
