import { Stack } from "expo-router";

import { palette } from "@global/constants/palette";

// サインイン済みユーザー向けの保護グループ。
// 作成・編集はモーダル、おしまいのお祝いはフェードの全画面で重ねる（デザイン TURN 5）。
export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // 画面遷移中の背景色。ナビゲータの option のため className は使えない（adr/0016 の逃げ道）
        contentStyle: { backgroundColor: palette.linen },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="plan/new" options={{ presentation: "modal" }} />
      <Stack.Screen name="plan/[id]/edit" options={{ presentation: "modal" }} />
      <Stack.Screen
        name="plan/[id]/closed"
        options={{ presentation: "fullScreenModal", animation: "fade" }}
      />
    </Stack>
  );
}
