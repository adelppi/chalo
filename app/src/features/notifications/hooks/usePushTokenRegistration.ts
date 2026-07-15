import { useEffect } from "react";

import type { NotificationPermission } from "../model/types";
import { useNotificationsContext } from "./NotificationsProvider";

// トークン登録（domain/notifications.md 1・adr/0007 系統2）。
// 通知権限が許可されている場合に Expo push token を取得して push_tokens に
// upsert する。端末の push token 更新でも取得し直して保存を更新する
// （subscribeToExpoPushToken が re-fetch の無限ループを避ける責務を持つ）。
// 失敗は静かに記録し、致命としない（non-functional.md「サーバ側 push の
// 送信失敗はユーザーに見せない」と同じ方針）。

/**
 * @param profileId サインイン中ユーザーの id。未サインインなら null
 * @param permission 通知権限の現在値。"granted" のときだけ登録する
 */
export function usePushTokenRegistration(
  profileId: string | null,
  permission: NotificationPermission | undefined,
): void {
  const { deviceNotificationRepository, pushTokenRepository } =
    useNotificationsContext();

  useEffect(() => {
    if (!profileId || permission !== "granted") {
      return;
    }
    let cancelled = false;

    const unsubscribe = deviceNotificationRepository.subscribeToExpoPushToken(
      (token) => {
        if (!token || cancelled) {
          return;
        }
        pushTokenRepository.upsertToken(profileId, token).catch((error) => {
          console.warn("push token を保存できませんでした", error);
        });
      },
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [
    profileId,
    permission,
    deviceNotificationRepository,
    pushTokenRepository,
  ]);
}
