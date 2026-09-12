// ビューワー下部のページドット（Claude Design 6b）。純粋関数（adr/0014）。

/** 同時に出すドットの最大数。デザインは18枚中5つを出している */
export const PHOTO_DOT_MAX = 5;

/**
 * 表示するドットに対応する写真の index を返す。
 * 写真が多いときは、現在位置を中心にした最大 maxDots 個の窓に絞る
 * （全部並べると小さくなりすぎて位置が読めないため）。
 */
export function photoDotWindow(
  index: number,
  total: number,
  maxDots: number = PHOTO_DOT_MAX,
): number[] {
  if (total <= 0 || maxDots <= 0) {
    return [];
  }
  const size = Math.min(total, maxDots);
  const half = Math.floor(size / 2);
  const start = Math.min(Math.max(index - half, 0), total - size);
  return Array.from({ length: size }, (_, offset) => start + offset);
}
