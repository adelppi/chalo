// 自動アルバムのドメイン型（docs/domain/album.md・adr/0013）。
// この feature は plans を知らない。対象区間の導出は plans 側が担う（adr/0015）。

/** 写真を抽出する区間。端末ローカル時刻の開始・終了（両端を含む） */
export type DateRange = {
  from: Date;
  to: Date;
};

/** 端末の写真ライブラリの写真1枚 */
export type Photo = {
  /**
   * 写真ライブラリ内の識別子。iOS は `ph://<localIdentifier>` 形式で、
   * そのまま画像 URI として使える（expo-image・Galeria。adr/0023）。
   */
  id: string;
  /** 撮影日時（UNIX ミリ秒）。ライブラリが持っていなければ null */
  takenAt: number | null;
};

/**
 * 写真ライブラリへのアクセス許可。iOS の限定アクセス（Limited Photo Access）は
 * 「許可されているが選んだ写真しか見えない」ため `limited` として区別する
 * （domain/album.md「権限」）。
 */
export type PhotoPermission = "all" | "limited" | "denied" | "undetermined";
