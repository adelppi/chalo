import type { PhotoPermission } from "./types";

// アルバム表示の判定ロジック（純粋関数。adr/0014）。

/** 3列グリッド（Claude Design 6a）。タイル間・列数はデザイン由来の固定値 */
export const ALBUM_COLUMNS = 3;
export const ALBUM_GRID_GAP = 6;
/** 読み込み中に並べるスケルトンのタイル数（Claude Design 6d は3行ぶん） */
export const ALBUM_SKELETON_COUNT = 9;

/**
 * グリッド1タイルの一辺。端数は切り捨てて、丸め誤差で最終列がはみ出さないようにする。
 * @param containerWidth グリッドを収める幅（画面幅から左右余白を引いたもの）
 */
export function albumTileSize(
  containerWidth: number,
  columns: number = ALBUM_COLUMNS,
  gap: number = ALBUM_GRID_GAP,
): number {
  const available = containerWidth - gap * (columns - 1);
  if (available <= 0) {
    return 0;
  }
  return Math.floor(available / columns);
}

/**
 * 写真が出せないときの理由。空表示の出し分けに使う（domain/album.md「エラー・空状態」）。
 * - `none` … 写真があるので空表示は出さない
 * - `no-photos` … 権限は足りていて、対象区間に撮影がなかっただけ
 * - `limited` … 限定アクセスのため対象区間の写真が見えていない可能性がある
 * - `denied` … 拒否済み。iOS 設定からしか戻せない
 * - `undetermined` … まだ要求していない（JIT。domain/onboarding.md）
 */
export type AlbumEmptyReason =
  "none" | "no-photos" | "limited" | "denied" | "undetermined";

export function albumEmptyReason(
  permission: PhotoPermission,
  photoCount: number,
): AlbumEmptyReason {
  if (photoCount > 0) {
    return "none";
  }
  switch (permission) {
    case "all":
      return "no-photos";
    case "limited":
      return "limited";
    case "denied":
      return "denied";
    case "undetermined":
      return "undetermined";
  }
}
