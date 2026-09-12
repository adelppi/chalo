// アルバム表示の文言整形（純粋関数。adr/0014）。

/**
 * ビューワーに出す撮影日時（Claude Design 6b「7月12日 14:32」）。
 * 端末ライブラリが撮影日時を持たない写真は null（時刻行を出さない）。
 */
export function formatTakenAt(takenAt: number | null): string | null {
  if (takenAt == null) {
    return null;
  }
  const date = new Date(takenAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${date.getMonth() + 1}月${date.getDate()}日 ${hours}:${minutes}`;
}

/** ビューワーのカウンター（Claude Design 6b「3 / 18」）。index は 0 始まり */
export function formatPhotoCounter(index: number, total: number): string {
  return `${index + 1} / ${total}`;
}
