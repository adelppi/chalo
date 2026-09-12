import type { DateRange, Photo, PhotoPermission } from "../model/types";

// 写真ライブラリの Repository interface（adr/0003 の流儀）。
// feature はこの抽象にだけ依存する。実装（expo-media-library）は global/data に
// 置き、合成ルートで結線する（adr/0015）。

export interface PhotoLibraryRepository {
  getPermission(): Promise<PhotoPermission>;

  /** OS の許可ダイアログを出す（出せるのは実質1回。domain/onboarding.md） */
  requestPermission(): Promise<PhotoPermission>;

  /**
   * 限定アクセスのとき、見せる写真を選びなおす OS のピッカーを出す。
   * 限定アクセス以外では何も起きない（domain/album.md「権限」）。
   */
  presentPermissionsPicker(): Promise<void>;

  /**
   * 区間内に撮影された写真を、撮影日時の昇順で返す（動画は含めない。
   * スクリーンショットは含める。domain/album.md「抽出ルール」）。
   *
   * 区間は任意の開始・終了を受け取れる。現状の呼び出し側はアルバム対象日
   * 1日ぶんを渡すだけだが、複数日にまたがるプランへ広げられるようにしておく。
   */
  getPhotosInRange(range: DateRange): Promise<Photo[]>;
}
