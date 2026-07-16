import { useRouter } from "expo-router";
import { useEffect } from "react";

import { NameConfirmScreen, useOnboardingProgress } from "@features/onboarding";

// 名前の確認（A3）。名前確認が完了すると（NameConfirmScreen の送信 → confirmName
// 成功 → invalidateQueries）ここの progress が更新され、この useEffect が
// A4「ペアの開始」（/pairing）へ push する。中断復帰（アプリkill後の再起動で
// 既に名前確認済み）の場合も、この画面がマウントされた時点で同じ判定が成立し、
// 同じ経路で /pairing へ進む。/pairing への遷移はこの useEffect が唯一の経路
// ―― NameConfirmScreen 側では push しない（二重に遷移してしまうため。Issue #40）。
// push で進むことで、この画面（オンボーディング開始時の唯一のスクリーン）が
// スタックの土台として残り、ペア成立後の dismissAll 等が正しく (tabs) まで
// 戻れるようにする。
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
