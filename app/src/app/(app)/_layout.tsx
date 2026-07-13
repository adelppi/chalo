import { Stack } from "expo-router";

import { palette } from "@global/constants/palette";

// サインイン済みユーザー向けの保護グループ。
// 作成・編集はシートではなく1枚の画面へのプッシュ遷移（デザイン TURN 5・C-3/D-2）。
// 戻るはどの画面もデザインどおり画面内の BackHeader が描く（iOS 26 の Liquid Glass
// ヘッダーだとボタンがガラスのカプセルに繋がりデザインと乖離するため。
// 戻るスワイプはネイティブのまま有効）。
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
      {/* プラン詳細（D-1）・作成（C-3）・編集（D-2）。戻るで閉じるフル画面。 */}
      <Stack.Screen name="plan/[id]/index" />
      <Stack.Screen name="plan/new" />
      <Stack.Screen name="plan/[id]/edit" />
      {/* おしまいのお祝い（D-3）。fullScreenModal で replace するとナビバーの状態が壊れ、
          もどった先に「(tabs)」のタイトルが残留するため、通常遷移 + フェードで重ねる。 */}
      <Stack.Screen name="plan/[id]/closed" options={{ animation: "fade" }} />
      {/* 招待コード発行（B-2）・コード入力（B-3）。 */}
      <Stack.Screen name="pairing/invite" />
      <Stack.Screen name="pairing/code" />
    </Stack>
  );
}
