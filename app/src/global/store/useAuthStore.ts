import { create } from "zustand";

// セッション状態の共有ストア（adr/0003: クライアント状態は Zustand）。
// AuthProvider が起動時のセッション確認と onAuthStateChange の結果を反映する。

export type AuthStatus = "loading" | "signedIn" | "signedOut";

type AuthState = {
  // "loading" の間はスプラッシュを保持し、ナビゲータを出さない。
  status: AuthStatus;
  userId: string | null;
  // userId があればサインイン済みとして status を更新する。
  setUser: (userId: string | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  status: "loading",
  userId: null,
  setUser: (userId) =>
    set({ userId, status: userId ? "signedIn" : "signedOut" }),
}));
