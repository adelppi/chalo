import { type Href, router } from "expo-router";
import { useEffect } from "react";

import { useNotificationsContext } from "./NotificationsProvider";

/**
 * 通知タップでプラン詳細へディープリンクする（adr/0002・domain/notifications.md）。
 * - アプリ終了状態からの起動：起動させた通知を初回に1度だけ処理する。
 * - バックグラウンド／フォアグラウンド：タップ購読で処理する。
 * 対象プランが削除済みでも遷移し、詳細画面が「見つかりません」（F-10）を出す。
 *
 * @param enabled 遷移先の plan/[id] 画面がナビゲータに登録された後に true にする
 *   （マウント前や、オンボーディング／ペアの各ガードで plan/[id] が未登録の間に
 *   遷移すると取りこぼされる。呼び出し元は (app)/_layout.tsx。Issue #56）
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
