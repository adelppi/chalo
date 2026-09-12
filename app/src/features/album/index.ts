// album feature の公開 API（バレル）。外部はここ経由でのみ参照する（adr/0015）。

export { PlanAlbum } from "./components/PlanAlbum";
export { AlbumProvider } from "./hooks/AlbumProvider";

// データ契約（Repository interface とドメイン型）。global/data の実装が参照する。
export type { PhotoLibraryRepository } from "./data";
// plans feature がアルバム対象区間を組み立てるのに使う（plans → album の一方向）
export type { DateRange, Photo, PhotoPermission } from "./model/types";
