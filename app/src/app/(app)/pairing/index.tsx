import { useCompleteOnboarding } from "@features/onboarding";
import { PairingStartScreen } from "@features/pairing";

// ペアをはじめる（B-1。オンボーディング A4「ペアの開始」を兼ねる）。
// 「ひとりではじめる」でオンボーディング完了を記録する（Issue #40）。
// pairing feature からの直接依存にすると require cycle になるため、
// ここ（app 層）で結線する（adr/0015）。
export default function PairingRoute() {
  const completeOnboarding = useCompleteOnboarding();

  return <PairingStartScreen onSolo={() => completeOnboarding.mutateAsync()} />;
}
