import "../global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { AuthProvider, useAuthStatus } from "@features/auth";
import { queryClient } from "@global/config/queryClient";
import {
  supabaseAuthRepository,
  supabaseProfileRepository,
} from "@global/data";

// セッション確認が終わるまでスプラッシュを保持する（Issue #8）。
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const status = useAuthStatus();

  useEffect(() => {
    if (status !== "loading") {
      SplashScreen.hideAsync();
    }
  }, [status]);

  if (status === "loading") {
    // スプラッシュ保持中。ナビゲータはまだ描画しない。
    return null;
  }

  // Expo Router の protected routes でサインイン状態に応じて出し分ける。
  // 未サインインで保護ルートに入ろうとすると sign-in へ自動リダイレクトされる。
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={status === "signedIn"}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={status === "signedOut"}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider
        authRepository={supabaseAuthRepository}
        profileRepository={supabaseProfileRepository}
      >
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
}
