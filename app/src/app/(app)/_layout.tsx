import { Stack } from "expo-router";

import { usePairState } from "@features/pairing";
import { palette } from "@global/constants/palette";

// サインイン済みユーザー向けの保護グループ。
// 作成・編集はシートではなく1枚の画面へのプッシュ遷移（デザイン TURN 5・C-3/D-2）。
// 戻る・編集・削除が要る画面は、既定の headerShown: false を各画面内の
// Stack.Screen options（global/utils/headerItems）で headerShown: true に上書きし、
// react-native-screens のネイティブバーボタンAPIで描く（Issue #28）。
// 戻るスワイプはネイティブのまま有効。
export default function AppLayout() {
  // パートナー消失（partner-left）を検知したら全画面ロックに入る（domain/pairing.md・adr/0018）。
  // 検知は起動・フォアグラウンド復帰時の再取得（adr/0004）に乗る。取得中（undefined）は通常表示。
  const { data: pairState } = usePairState();
  const partnerLeft = pairState?.status === "partner-left";

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // 画面遷移中の背景色。ナビゲータの option のため className は使えない（adr/0016 の逃げ道）
        contentStyle: { backgroundColor: palette.linen },
      }}
    >
      <Stack.Protected guard={!partnerLeft}>
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
        {/* ペア設定（B-1）・成立後の通知プライミング（B-4）・成立お祝い（B-5）。
            Protected の外に自動登録されるとロック中も到達できてしまうため明示する。 */}
        <Stack.Screen name="pairing/index" />
        <Stack.Screen name="pairing/notifications" />
        <Stack.Screen name="pairing/success" />
      </Stack.Protected>
      {/* ロック中は書き出しとアカウント削除だけができる1画面に閉じ込める。 */}
      <Stack.Protected guard={partnerLeft}>
        <Stack.Screen name="partner-left" />
      </Stack.Protected>
    </Stack>
  );
}
