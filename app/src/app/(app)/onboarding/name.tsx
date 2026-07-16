import { useRouter } from "expo-router";
import { useEffect } from "react";

import { NameConfirmScreen, useOnboardingProgress } from "@features/onboarding";

// 名前の確認（A3）。中断復帰で既に名前確認を終えていれば、
// A4「ペアの開始」（/pairing）から再開する（domain/onboarding.md）。
// push で進む（NameConfirmScreen の送信時と同じ遷移方法にそろえ、
// この画面をスタックの土台として残す。Issue #40）。
//
// complete も見て判定する：オンボーディング完了（(app)/_layout のガードが
// (tabs) に切り替わる直前）に、この画面へ一瞬 back() で戻るタイミングが
// あり得るため、nameConfirmed だけで判定すると /pairing への push を
// 繰り返してしまう（無限ループのように見える不具合になる）。complete
// なら何もせず、外側のガードが (tabs) へ切り替えるのを待つ。
export default function OnboardingNameRoute() {
  const router = useRouter();
  const { data: progress } = useOnboardingProgress();
  const complete = progress?.complete ?? false;
  const shouldResumeAtPairing = (progress?.nameConfirmed ?? false) && !complete;

  useEffect(() => {
    if (shouldResumeAtPairing) {
      router.push("/pairing");
    }
  }, [shouldResumeAtPairing, router]);

  if (shouldResumeAtPairing || complete) {
    return null;
  }

  return <NameConfirmScreen />;
}
