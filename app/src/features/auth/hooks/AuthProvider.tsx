import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
} from "react";

import { useAuthStore } from "@global/store/useAuthStore";

import type { AuthRepository, ProfileRepository } from "../data";

type AuthContextValue = {
  authRepository: AuthRepository;
  profileRepository: ProfileRepository;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Repository を注入で受け取る合成ルート（adr/0003）。
// 起動時にセッションを復元し、以降の認証状態変化を Zustand ストアへ反映する。
export function AuthProvider({
  authRepository,
  profileRepository,
  children,
}: AuthContextValue & { children: ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    let active = true;

    authRepository
      .getSession()
      .then((session) => {
        if (active) {
          setUser(session?.user.id ?? null);
        }
      })
      .catch((error: unknown) => {
        console.error("セッションの復元に失敗しました", error);
        if (active) {
          setUser(null);
        }
      });

    const unsubscribe = authRepository.onAuthStateChange((session) => {
      setUser(session?.user.id ?? null);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [authRepository, setUser]);

  const value = useMemo(
    () => ({ authRepository, profileRepository }),
    [authRepository, profileRepository],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext は AuthProvider の内側で使ってください。");
  }
  return context;
}
