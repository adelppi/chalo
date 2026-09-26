// 画面内の見出しがスクロールでナビバーの下へ隠れたかどうか（Issue #107）。
// 詳細・作成・編集は見出しを画面内に描くため、見出しが隠れてからだけ
// ナビバーに小さなタイトルを出す。見出しの下端（スクロール内容の上端基準）を
// 越えてスクロールしたら「隠れた」とみなす。見出しの位置が未計測なら出さない。
export function isHeadingScrolledPast(
  scrollY: number,
  headingBottom: number | null,
): boolean {
  if (headingBottom === null) {
    return false;
  }
  return scrollY >= headingBottom;
}
