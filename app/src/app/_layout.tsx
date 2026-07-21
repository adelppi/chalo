import "../global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { AuthProvider, useAuthStatus } from "@features/auth";
import { CalendarProvider } from "@features/calendar";
import {
  NotificationsProvider,
  useNotificationPermission,
  usePushTokenRegistration,
} from "@features/notifications";
import { OnboardingProvider } from "@features/onboarding";
import { PairingProvider } from "@features/pairing";
import { PlansProvider } from "@features/plans";
import { SettingsProvider } from "@features/settings";
import { ToastHost } from "@global/components/shared";
import { queryClient } from "@global/config/queryClient";
import {
  asyncStorageCalendarStorage,
  asyncStorageNotificationStorage,
  asyncStorageOnboardingRepository,
  expoCalendarRepository,
  expoFileShareRepository,
  expoNotificationRepository,
  supabaseAuthRepository,
  supabaseBugReportRepository,
  supabasePairingRepository,
  supabasePlanRepository,
  supabaseProfileRepository,
  supabasePushTokenRepository,
  supabaseSettingsRepository,
} from "@global/data";
import { useScreenViewLogging } from "@global/hooks/useScreenViewLogging";
import { setupLogging } from "@global/lib/logging";
import { useAuthStore } from "@global/store/useAuthStore";

// セッション確認が終わるまでスプラッシュを保持する（Issue #8）。
SplashScreen.preventAutoHideAsync();

// 端末内ログ（adr/0011）。未捕捉エラーの記録と BG 移行時のフラッシュを結線する。
setupLogging();

function RootNavigator() {
  const status = useAuthStatus();
  const userId = useAuthStore((state) => state.userId);
  const ready = status !== "loading";

  // 画面遷移を端末内ログへ記録する（ルート名と UUID のみ。features.md 11.4）。
  useScreenViewLogging();

  // 通知タップ→プラン詳細へのディープリンク（domain/notifications.md）は
  // (app)/_layout.tsx（AppLayout）側で結線する：plan/[id] はオンボーディング・
  // ペアの各ガードが確定してから登録されるため、認証確定（ready）だけを条件に
  // ここで発行すると、ガード確定前の push が取りこぼされる（Issue #56）。

  // 作成通知（サーバ push）の宛先登録。権限が許可されていれば
  // Expo push token を push_tokens に upsert する（domain/notifications.md 1）。
  const { data: notificationPermission } = useNotificationPermission();
  usePushTokenRegistration(
    status === "signedIn" ? userId : null,
    notificationPermission,
  );

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
            <OnboardingProvider
              onboardingRepository={asyncStorageOnboardingRepository}
            >
              <SettingsProvider
                settingsRepository={supabaseSettingsRepository}
                fileShareRepository={expoFileShareRepository}
                bugReportRepository={supabaseBugReportRepository}
              >
                <CalendarProvider
                  deviceCalendarRepository={expoCalendarRepository}
                  calendarStorageRepository={asyncStorageCalendarStorage}
                >
                  <NotificationsProvider
                    deviceNotificationRepository={expoNotificationRepository}
                    notificationStorageRepository={
                      asyncStorageNotificationStorage
                    }
                    pushTokenRepository={supabasePushTokenRepository}
                  >
                    <StatusBar style="dark" />
                    <RootNavigator />
                    <ToastHost />
                  </NotificationsProvider>
                </CalendarProvider>
              </SettingsProvider>
            </OnboardingProvider>
          </PairingProvider>
        </PlansProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
