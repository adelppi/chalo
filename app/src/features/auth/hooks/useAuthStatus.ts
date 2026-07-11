import { type AuthStatus, useAuthStore } from "@global/store/useAuthStore";

// 現在の認証ステータス（"loading" | "signedIn" | "signedOut"）を購読する。
// ルーティングのガードやスプラッシュ制御に使う。
export function useAuthStatus(): AuthStatus {
  return useAuthStore((state) => state.status);
}
