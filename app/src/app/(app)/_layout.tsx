import { Stack } from "expo-router";

import {
  needsOnboarding as computeNeedsOnboarding,
  shouldWaitForPairState,
  useOnboardingProgress,
} from "@features/onboarding";
import { useNotificationObserver } from "@features/notifications";
import { usePairState } from "@features/pairing";
import { palette } from "@global/constants/palette";
import { backHeaderStaticOptions } from "@global/utils/headerItems";

const EMPTY_PROGRESS = { nameConfirmed: false, complete: false };

// サインイン済みユーザー向けの保護グループ。
// 作成・編集はシートではなく1枚の画面へのプッシュ遷移（デザイン TURN 5・C-3/D-2）。
// 戻る・編集・削除が要る画面は、既定の headerShown: false を各画面内の
// Stack.Screen options（global/utils/headerItems）で headerShown: true に上書きし、
// react-native-screens のネイティブバーボタンAPIで描く（Issue #28）。
// 戻るスワイプはネイティブのまま有効。
export default function AppLayout() {
  // パートナー消失（partner-left）を検知したら全画面ロックに入る（domain/pairing.md・adr/0018）。
  // 検知は起動・フォアグラウンド復帰時の再取得（adr/0004）に乗る。取得中（undefined）は通常表示。
  const {
    data: pairState,
    isPending: pairStatePending,
    isPaused: pairStatePaused,
  } = usePairState();
  const { data: onboardingProgress, isPending: onboardingPending } =
    useOnboardingProgress();
  const partnerLeft = pairState?.status === "partner-left";
  const paired = pairState?.status === "paired";
  const progress = onboardingProgress ?? EMPTY_PROGRESS;

  // pairState（サーバのペア状態）の解決を待つ。ローカル進捗だけで即「未ペア」
  // 扱いに決め打ちすると、招待コードでペアが成立した側が再起動直後にオンボー
  // ディングへ逆戻りする（Issue #56。ローカルで完了済み・オフライン等で通信が
  // 止まっている場合は待たない。詳細は shouldWaitForPairState のコメント）。
  const waitingForPairState = shouldWaitForPairState(progress, {
    isPending: pairStatePending,
    isPaused: pairStatePaused,
  });
  const needsOnboarding = computeNeedsOnboarding(progress, paired);

  // 通知タップ→プラン詳細（domain/notifications.md）。plan/[id] は
  // needsOnboarding ガードの内側でのみ登録されるため、ここでガードが確定して
  // この Stack がその構成で描画される回になるまで発行を待つ（Issue #56。
  // 認証確定だけを条件にしていた app/_layout.tsx から移設。取りこぼし防止）。
  useNotificationObserver(
    !onboardingPending &&
      !waitingForPairState &&
      !partnerLeft &&
      !needsOnboarding,
  );

  // オンボーディング進捗（端末ローカル）・pairState の解決待ち。進捗はネット
  // ワーク不要で一瞬なので、ここで待たないとオンボーディング未完了の新規
  // ユーザーが一瞬 (tabs) を見てしまう（Issue #40）。
  if (onboardingPending || waitingForPairState) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // 画面遷移中の背景色。ナビゲータの option のため className は使えない（adr/0016 の逃げ道）
        contentStyle: { backgroundColor: palette.linen },
      }}
    >
      <Stack.Protected guard={!partnerLeft}>
        <Stack.Protected guard={!needsOnboarding}>
          <Stack.Screen name="(tabs)" />
          {/* プラン詳細（D-1）・作成（C-3）・編集（D-2）。戻るで閉じるフル画面。
              D-1 は headerShown 等の静的なヘッダー設定をここで先に確定させる。画面側の
              Stack.Screen（backHeaderOptions）に任せると、マウント後に headerShown が
              false→true へ切り替わる一瞬が生まれ、初回プッシュ時だけタイトルが隠れてから
              ガクッと下がって見える（Issue #48）。 */}
          <Stack.Screen
            name="plan/[id]/index"
            options={backHeaderStaticOptions}
          />
          <Stack.Screen name="plan/new" />
          <Stack.Screen name="plan/[id]/edit" />
          {/* おしまいのお祝い（D-3）。fullScreenModal で replace するとナビバーの状態が壊れ、
              もどった先に「(tabs)」のタイトルが残留するため、通常遷移 + フェードで重ねる。 */}
          <Stack.Screen
            name="plan/[id]/closed"
            options={{ animation: "fade" }}
          />
        </Stack.Protected>
        {/* 名前の確認（A3）。サインイン直後、オンボーディング未完了の新規ユーザーが着地する
            （Issue #40・domain/onboarding.md）。 */}
        <Stack.Protected guard={needsOnboarding}>
          <Stack.Screen name="onboarding/name" />
        </Stack.Protected>
        {/* 招待コード発行（B-2）・コード入力（B-3）。 */}
        <Stack.Screen name="pairing/invite" />
        <Stack.Screen name="pairing/code" />
        {/* ペア設定（B-1。A4「ペアの開始」を兼ねる）・成立後の通知プライミング（B-4）・
            成立お祝い（B-5）。Protected の外に自動登録されるとロック中も到達できて
            しまうため明示する。onboarding/(tabs) どちらのガードにも属さず常に到達可能
            にする：オンボーディング中の A4 と、設定 E-1b からの再オープンの両方で使う。 */}
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
