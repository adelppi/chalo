import { useCompleteOnboarding } from "@features/onboarding";
import { EnterCodeScreen } from "@features/pairing";

// コード入力（B-3。エラー表示は B-4／F-3）。
// コードでペアが成立したタイミングでオンボーディング完了を記録する
// （domain/onboarding.md・Issue #56）。pairing feature からの直接依存にすると
// require cycle になるため、ここ（app 層）で結線する（adr/0015）。
export default function PairingCodeRoute() {
  const completeOnboarding = useCompleteOnboarding();
  return <EnterCodeScreen onPaired={() => completeOnboarding.mutateAsync()} />;
}
