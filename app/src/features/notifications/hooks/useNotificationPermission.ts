import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { notificationKeys } from "../data/queryKeys";
import type { NotificationPermission } from "../model/types";
import { useNotificationsContext } from "./NotificationsProvider";

/** 通知権限の現在値（granted / denied / undetermined） */
export function useNotificationPermission() {
  const { deviceNotificationRepository } = useNotificationsContext();
  return useQuery({
    queryKey: notificationKeys.permission,
    queryFn: () => deviceNotificationRepository.getPermission(),
  });
}

/**
 * OS の許可ダイアログを出す（JIT＋プライミング。domain/onboarding.md）。
 * iOS の仕様で実ダイアログを出せるのは実質1回。以降は iOS 設定へ誘導する。
 */
export function useRequestNotificationPermission() {
  const { deviceNotificationRepository } = useNotificationsContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deviceNotificationRepository.requestPermission(),
    onSuccess: (permission: NotificationPermission) => {
      queryClient.setQueryData(notificationKeys.permission, permission);
    },
  });
}
