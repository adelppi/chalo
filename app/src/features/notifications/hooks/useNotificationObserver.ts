import { type Href, router } from "expo-router";
import { useEffect } from "react";

import { useNotificationsContext } from "./NotificationsProvider";

/**
 * 通知タップでプラン詳細へディープリンクする（adr/0002・domain/notifications.md）。
 * - アプリ終了状態からの起動：起動させた通知を初回に1度だけ処理する。
 * - バックグラウンド／フォアグラウンド：タップ購読で処理する。
 * 対象プランが削除済みでも遷移し、詳細画面が「見つかりません」（F-10）を出す。
 *
 * @param enabled ナビゲータのマウント後に true にする（マウント前の遷移はエラーになる）
 */
export function useNotificationObserver(enabled: boolean) {
  const { deviceNotificationRepository } = useNotificationsContext();

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const redirect = (url: string | null) => {
      if (url) {
        router.push(url as Href);
      }
    };
    redirect(deviceNotificationRepository.getInitialNotificationUrl());
    return deviceNotificationRepository.addNotificationResponseListener(
      redirect,
    );
  }, [enabled, deviceNotificationRepository]);
}
