import "../global.css";

import {
  useFonts,
  ZenMaruGothic_400Regular,
  ZenMaruGothic_500Medium,
  ZenMaruGothic_700Bold,
  ZenMaruGothic_900Black,
} from "@expo-google-fonts/zen-maru-gothic";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { AuthProvider, useAuthStatus } from "@features/auth";
import { PairingProvider } from "@features/pairing";
import { PlansProvider } from "@features/plans";
import { SettingsProvider } from "@features/settings";
import { ToastHost } from "@global/components/shared";
import { queryClient } from "@global/config/queryClient";
import {
  fakePairingRepository,
  fakePlanRepository,
  fakeSettingsRepository,
  supabaseAuthRepository,
  supabaseProfileRepository,
} from "@global/data";

// セッション確認が終わるまでスプラッシュを保持する（Issue #8）。
SplashScreen.preventAutoHideAsync();

function RootNavigator({ fontsLoaded }: { fontsLoaded: boolean }) {
  const status = useAuthStatus();
  const ready = status !== "loading" && fontsLoaded;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
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
  // デザイン全編で使う Zen Maru Gothic（tailwind.config の font-zen-* に対応）
  const [fontsLoaded] = useFonts({
    ZenMaruGothic_400Regular,
    ZenMaruGothic_500Medium,
    ZenMaruGothic_700Bold,
    ZenMaruGothic_900Black,
  });

  // 合成ルート：Repository interface と実装をここで結線する（adr/0003・adr/0015）。
  // plans / pairing / settings は Issue #14 のモック段階のため in-memory フェイク。
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider
        authRepository={supabaseAuthRepository}
        profileRepository={supabaseProfileRepository}
      >
        <PlansProvider planRepository={fakePlanRepository}>
          <PairingProvider pairingRepository={fakePairingRepository}>
            <SettingsProvider settingsRepository={fakeSettingsRepository}>
              <StatusBar style="dark" />
              <RootNavigator fontsLoaded={fontsLoaded} />
              <ToastHost />
            </SettingsProvider>
          </PairingProvider>
        </PlansProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
