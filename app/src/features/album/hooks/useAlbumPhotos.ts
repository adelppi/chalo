import { useQuery } from "@tanstack/react-query";

import { albumKeys } from "../data/queryKeys";
import type { DateRange, PhotoPermission } from "../model/types";
import { useAlbumContext } from "./AlbumProvider";

/**
 * 対象区間に撮影された端末写真。
 *
 * 表示のたびにライブラリから引きなおし、アプリ側には残さない（adr/0013）。
 * `gcTime: 0` でアンマウント時に即破棄し、次に開いたときは必ず再取得になる。
 */
export function useAlbumPhotos(range: DateRange, permission?: PhotoPermission) {
  const { photoLibraryRepository } = useAlbumContext();
  const granted = permission === "all" || permission === "limited";
  return useQuery({
    queryKey: albumKeys.photos(range.from.getTime(), range.to.getTime()),
    queryFn: () => photoLibraryRepository.getPhotosInRange(range),
    // 許可前に引いても 0 件が返るだけ。権限が確定するまで走らせない
    enabled: granted,
    gcTime: 0,
  });
}
