import "../global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { AuthProvider, useAuthStatus } from "@features/auth";
import { CalendarProvider } from "@features/calendar";
import { PairingProvider } from "@features/pairing";
import { PlansProvider } from "@features/plans";
import { SettingsProvider } from "@features/settings";
import { ToastHost } from "@global/components/shared";
import { queryClient } from "@global/config/queryClient";
import {
  asyncStorageCalendarStorage,
  expoCalendarRepository,
  supabaseAuthRepository,
  supabasePairingRepository,
  supabasePlanRepository,
  supabaseProfileRepository,
  supabaseSettingsRepository,
} from "@global/data";

// セッション確認が終わるまでスプラッシュを保持する（Issue #8）。
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const status = useAuthStatus();
  const ready = status !== "loading";

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
  // フォントは OS 標準（システムフォント）。読み込み待ちは不要（Issue #16・adr/0016）。
  // 合成ルート：Repository interface と実装をここで結線する（adr/0003・adr/0015）。
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider
        authRepository={supabaseAuthRepository}
        profileRepository={supabaseProfileRepository}
      >
        <PlansProvider planRepository={supabasePlanRepository}>
          <PairingProvider pairingRepository={supabasePairingRepository}>
            <SettingsProvider settingsRepository={supabaseSettingsRepository}>
              <CalendarProvider
                deviceCalendarRepository={expoCalendarRepository}
                calendarStorageRepository={asyncStorageCalendarStorage}
              >
                <StatusBar style="dark" />
                <RootNavigator />
                <ToastHost />
              </CalendarProvider>
            </SettingsProvider>
          </PairingProvider>
        </PlansProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
