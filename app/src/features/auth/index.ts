// auth feature の公開 API（バレル）。外部はここ経由でのみ参照する（adr/0015）。

export { AuthProvider } from "./hooks/AuthProvider";
export { useAuthStatus } from "./hooks/useAuthStatus";
export { useSignInWithApple } from "./hooks/useSignInWithApple";
export { useSignInWithGoogle } from "./hooks/useSignInWithGoogle";
export { useSignOut } from "./hooks/useSignOut";
export { useDeleteAccount } from "./hooks/useDeleteAccount";
export { SignInScreen } from "./components/SignInScreen";

// データ契約（Repository interface とドメイン型）。global/data の Supabase 実装が参照する。
export type {
  AuthRepository,
  AuthSession,
  AuthUser,
  EnsureProfileInput,
  Profile,
  ProfileRepository,
  ProviderIdentity,
  SignInResult,
} from "./data";
