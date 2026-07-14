import * as Notifications from "expo-notifications";

import type {
  DeadlineNotificationInput,
  DeviceNotificationRepository,
  NotificationPermission,
} from "@features/notifications";
import { extractNotificationUrl } from "@features/notifications";

// ローカル通知の expo-notifications 実装（adr/0007 系統1）。

// フォアグラウンド受信時もバナー・通知センターに表示する
// （domain/notifications.md「通知タップ遷移」の前提。音・バッジは鳴らさない）。
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// iOS は許可状態が細かいため、root の status ではなく ios.status で判定する
// （expo-notifications ドキュメントの推奨）。
function toPermission(
  response: Notifications.NotificationPermissionsStatus,
): NotificationPermission {
  const iosStatus = response.ios?.status;
  if (iosStatus != null) {
    switch (iosStatus) {
      case Notifications.IosAuthorizationStatus.AUTHORIZED:
      case Notifications.IosAuthorizationStatus.PROVISIONAL:
      case Notifications.IosAuthorizationStatus.EPHEMERAL:
        return "granted";
      case Notifications.IosAuthorizationStatus.DENIED:
        return "denied";
      default:
        return "undetermined";
    }
  }
  if (response.granted) {
    return "granted";
  }
  return response.canAskAgain ? "undetermined" : "denied";
}

export const expoNotificationRepository: DeviceNotificationRepository = {
  async getPermission(): Promise<NotificationPermission> {
    return toPermission(await Notifications.getPermissionsAsync());
  },

  async requestPermission(): Promise<NotificationPermission> {
    return toPermission(
      await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: true, allowSound: true },
      }),
    );
  },

  async scheduleDeadlineNotification(
    input: DeadlineNotificationInput,
  ): Promise<string> {
    return Notifications.scheduleNotificationAsync({
      content: {
        title: input.title,
        body: input.body,
        data: { url: input.url },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: input.fireDate,
      },
    });
  },

  async cancelScheduledNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  },

  getInitialNotificationUrl(): string | null {
    const response = Notifications.getLastNotificationResponse();
    return extractNotificationUrl(response?.notification.request.content.data);
  },

  addNotificationResponseListener(
    listener: (url: string | null) => void,
  ): () => void {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        listener(
          extractNotificationUrl(response.notification.request.content.data),
        );
      },
    );
    return () => subscription.remove();
  },
};
