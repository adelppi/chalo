// おしまい完了（D-3）の見出し。表示のたびに複数の挨拶からランダムに選ぶ（Issue #16）。
// ランダム値を注入する純粋関数に切り出し、Jest でテストする（adr/0014）。

export const CLOSED_GREETINGS = ["おつかれさま！", "おかえり！"] as const;

/**
 * 0〜1 の乱数から挨拶をえらぶ。`random` は `Math.random()`（[0, 1)）を想定する。
 * 端や範囲外の値でも配列の外を指さないようにクランプする。
 */
export function pickClosedGreeting(random: number): string {
  const ratio = Math.min(Math.max(random, 0), 0.999999);
  const index = Math.floor(ratio * CLOSED_GREETINGS.length);
  return CLOSED_GREETINGS[index];
}
