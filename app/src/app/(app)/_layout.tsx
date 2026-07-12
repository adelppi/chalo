import { Stack } from "expo-router";

import { palette } from "@global/constants/palette";

// 画面のナビゲーションヘッダー（戻る/編集/削除はここに統合する。Issue #16）。
// 背景は linen・影なし・タイトルは各画面が本文に大きく出すため空にする。
// ナビゲータの option のため className は使えない（adr/0016 の逃げ道）。
const nativeHeaderOptions = {
  headerShown: true,
  headerStyle: { backgroundColor: palette.linen },
  headerShadowVisible: false,
  headerTintColor: palette.ink,
  headerTitle: "",
  headerBackButtonDisplayMode: "minimal",
} as const;

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
      {/* プラン詳細（D-1）。戻るはネイティブ、編集/削除は画面側で headerRight に足す。 */}
      <Stack.Screen name="plan/[id]/index" options={nativeHeaderOptions} />
      <Stack.Screen
        name="plan/new"
        options={{ ...nativeHeaderOptions, presentation: "modal" }}
      />
      <Stack.Screen
        name="plan/[id]/edit"
        options={{ ...nativeHeaderOptions, presentation: "modal" }}
      />
      <Stack.Screen
        name="plan/[id]/closed"
        options={{ presentation: "fullScreenModal", animation: "fade" }}
      />
      {/* 招待コード発行（B-2）・コード入力（B-3）。戻るをヘッダーに統合。 */}
      <Stack.Screen name="pairing/invite" options={nativeHeaderOptions} />
      <Stack.Screen name="pairing/code" options={nativeHeaderOptions} />
    </Stack>
  );
}
