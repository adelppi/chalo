import {
  AssetField,
  getPermissionsAsync,
  MediaType,
  type PermissionResponse,
  presentPermissionsPicker,
  Query,
  requestPermissionsAsync,
} from "expo-media-library/next";

import type {
  DateRange,
  Photo,
  PhotoLibraryRepository,
  PhotoPermission,
} from "@features/album";

// 端末の写真ライブラリの expo-media-library 実装（adr/0013・adr/0023）。
// 日付クエリで対象区間のアセットだけを引く（全件走査しない。non-functional.md）。

function toPermission(response: PermissionResponse): PhotoPermission {
  if (response.status === "granted") {
    // iOS の限定アクセスは status が granted のまま accessPrivileges で判別する
    return response.accessPrivileges === "limited" ? "limited" : "all";
  }
  if (response.status === "undetermined") {
    return "undetermined";
  }
  return "denied";
}

export const expoPhotoLibraryRepository: PhotoLibraryRepository = {
  async getPermission(): Promise<PhotoPermission> {
    return toPermission(await getPermissionsAsync());
  },

  async requestPermission(): Promise<PhotoPermission> {
    return toPermission(await requestPermissionsAsync());
  },

  async presentPermissionsPicker(): Promise<void> {
    await presentPermissionsPicker(["photo"]);
  },

  async getPhotosInRange({ from, to }: DateRange): Promise<Photo[]> {
    // 撮影日時の範囲で PHAsset を引く。動画は除き（domain/album.md）、
    // スクリーンショットは写真なのでそのまま含まれる。
    // exeForMetadata はファイルパスを解決しないぶん軽く、返る id が
    // そのまま画像 URI（ph://）として使える。
    const assets = await new Query()
      .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
      .gte(AssetField.CREATION_TIME, from.getTime())
      .lte(AssetField.CREATION_TIME, to.getTime())
      .orderBy({ key: AssetField.CREATION_TIME, ascending: true })
      .exeForMetadata();

    return assets.map((asset) => ({
      id: asset.id,
      takenAt: asset.creationTime,
    }));
  },
};
