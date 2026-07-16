import { Stack } from "expo-router";

import {
  useCompleteOnboarding,
  useOnboardingProgress,
} from "@features/onboarding";
import { PairingStartScreen } from "@features/pairing";

// ペアをはじめる（B-1。オンボーディング A4「ペアの開始」を兼ねる）。
// 「ひとりではじめる」でオンボーディング完了を記録する（Issue #40）。
// pairing feature からの直接依存にすると require cycle になるため、
// ここ（app 層）で結線する（adr/0015）。
export default function PairingRoute() {
  const completeOnboarding = useCompleteOnboarding();
  const { data: progress } = useOnboardingProgress();

  // A4 として使われている間（オンボーディング未完了）は戻るスワイプを無効にする。
  // このとき手前の画面は onboarding/name（名前確認済みで何も描画しない待避用の
  // 画面）で、戻っても空白で操作できない画面になってしまうため（Issue #40）。
  // 設定 E-1b からの再オープン時（オンボーディング完了後）は手前が実際の設定
  // 画面なので、通常どおり戻るスワイプを有効にする。
  const isOnboardingStep = !(progress?.complete ?? false);

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: !isOnboardingStep }} />
      <PairingStartScreen onSolo={() => completeOnboarding.mutateAsync()} />
    </>
  );
}
