import type { Session } from "@supabase/supabase-js";
import * as AppleAuthentication from "expo-apple-authentication";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";

import type {
  AuthRepository,
  AuthSession,
  ProviderIdentity,
  SignInResult,
} from "@features/auth";
import { supabase } from "@global/lib/supabase";

// expo-apple-authentication がユーザーのキャンセル時に返すエラーコード。
const APPLE_CANCELED_CODE = "ERR_REQUEST_CANCELED";

function isAppleCancellation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === APPLE_CANCELED_CODE
  );
}

// Web 用途の後片付け（React Native では no-op に近いが公式手順に従う）。
WebBrowser.maybeCompleteAuthSession();

// カスタム URL スキーム（app.json の "scheme": "chalo"）に基づくリダイレクト先。
// この値を Supabase Dashboard の Redirect URLs に登録する必要がある。
const redirectTo = makeRedirectUri();

function toAuthSession(session: Session | null): AuthSession | null {
  if (!session) {
    return null;
  }
  return {
    user: {
      id: session.user.id,
      email: session.user.email ?? null,
    },
  };
}

function pickString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

// OAuth リダイレクト URL からセッションを確立する（Google ブラウザフロー）。
async function createSessionFromUrl(url: string): Promise<Session> {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) {
    throw new Error(errorCode);
  }

  const { access_token, refresh_token } = params;
  if (!access_token) {
    throw new Error(
      "サインインに失敗しました（アクセストークンが取得できませんでした）。",
    );
  }

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) {
    throw error;
  }
  if (!data.session) {
    throw new Error(
      "サインインに失敗しました（セッションを確立できませんでした）。",
    );
  }
  return data.session;
}

function googleIdentity(session: Session): ProviderIdentity {
  const meta = session.user.user_metadata ?? {};
  return {
    email: session.user.email ?? null,
    fullName: pickString(meta.full_name) ?? pickString(meta.name),
    appleFullName: null,
    avatarUrl: pickString(meta.avatar_url) ?? pickString(meta.picture),
  };
}

export const supabaseAuthRepository: AuthRepository = {
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw error;
    }
    return toAuthSession(data.session);
  },

  onAuthStateChange(listener) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      listener(toAuthSession(session));
    });
    return () => data.subscription.unsubscribe();
  },

  async signInWithGoogle(): Promise<SignInResult | null> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) {
      throw error;
    }

    const result = await WebBrowser.openAuthSessionAsync(
      data?.url ?? "",
      redirectTo,
    );
    if (result.type !== "success") {
      // ユーザーがブラウザを閉じた／中断した。
      return null;
    }

    const session = await createSessionFromUrl(result.url);
    return {
      session: toAuthSession(session)!,
      identity: googleIdentity(session),
    };
  },

  async signInWithApple(): Promise<SignInResult | null> {
    let credential: AppleAuthentication.AppleAuthenticationCredential;
    try {
      credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
    } catch (error) {
      if (isAppleCancellation(error)) {
        return null;
      }
      throw error;
    }

    if (!credential.identityToken) {
      throw new Error(
        "Apple サインインに失敗しました（identityToken が取得できませんでした）。",
      );
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: credential.identityToken,
    });
    if (error) {
      throw error;
    }
    if (!data.session) {
      throw new Error(
        "Apple サインインに失敗しました（セッションを確立できませんでした）。",
      );
    }

    // Apple の氏名・メールは初回サインイン時のみ credential に含まれる。
    const identity: ProviderIdentity = {
      email: credential.email ?? data.session.user.email ?? null,
      fullName: null,
      appleFullName: credential.fullName
        ? {
            givenName: credential.fullName.givenName ?? null,
            familyName: credential.fullName.familyName ?? null,
          }
        : null,
      avatarUrl: null,
    };

    return {
      session: toAuthSession(data.session)!,
      identity,
    };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  },
};
