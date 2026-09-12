import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { log } from "@global/lib/logging";

import { albumKeys } from "../data/queryKeys";
import type { PhotoPermission } from "../model/types";
import { useAlbumContext } from "./AlbumProvider";

/** 写真ライブラリ権限の現在値（all / limited / denied / undetermined） */
export function usePhotoPermission() {
  const { photoLibraryRepository } = useAlbumContext();
  return useQuery({
    queryKey: albumKeys.permission,
    queryFn: () => photoLibraryRepository.getPermission(),
  });
}

/**
 * OS の許可ダイアログを出す（JIT。domain/onboarding.md「アルバムを初めて開いたとき」）。
 * iOS の仕様で実ダイアログを出せるのは実質1回。以降は iOS 設定へ誘導する。
 */
export function useRequestPhotoPermission() {
  const { photoLibraryRepository } = useAlbumContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => photoLibraryRepository.requestPermission(),
    onSuccess: (permission: PhotoPermission) => {
      // 権限要求の結果を記録する（features.md 11.4）
      log("info", "photo_permission_result", { detail: permission });
      queryClient.setQueryData(albumKeys.permission, permission);
      // 許可されると対象区間の写真が読めるようになる
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
    },
  });
}

/**
 * 限定アクセスの選択内容を変更する OS のピッカーを出す（domain/album.md「権限」）。
 * 閉じたあとに何が選ばれたかは iOS から返らないため、写真を取りなおして反映する。
 */
export function useExpandPhotoAccess() {
  const { photoLibraryRepository } = useAlbumContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => photoLibraryRepository.presentPermissionsPicker(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
    },
  });
}
