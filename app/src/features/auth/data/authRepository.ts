import type { AuthSession, SignInResult } from "./types";

// 認証の Repository interface。feature はこの抽象にのみ依存する（adr/0003）。
// Supabase 実装は global/data に置く。
export interface AuthRepository {
  // 現在のセッションを返す（なければ null）。起動時のセッション復元に使う。
  getSession(): Promise<AuthSession | null>;

  // 認証状態の変化を購読する。返り値は購読解除関数。
  onAuthStateChange(
    listener: (session: AuthSession | null) => void,
  ): () => void;

  // Google サインイン（OIDC ブラウザフロー）。ユーザーが中断したら null を返す。
  signInWithGoogle(): Promise<SignInResult | null>;

  // Apple サインイン（expo-apple-authentication）。ユーザーが中断したら null を返す。
  signInWithApple(): Promise<SignInResult | null>;

  // サインアウト。
  signOut(): Promise<void>;

  // アカウント削除（domain/pairing.md・adr/0018）。サーバ側で退会処理を行い、
  // 成功したらローカルセッションも破棄する。Apple 連携ユーザーはトークン失効のため
  // 再認証を挟み、ユーザーが再認証を中断したら削除せず false を返す。
  deleteAccount(): Promise<boolean>;
}
