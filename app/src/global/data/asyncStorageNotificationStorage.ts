import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  DeadlineNotificationLink,
  NotificationStorageRepository,
} from "@features/notifications";
import {
  findDeadlineNotificationLink,
  parseDeadlineNotificationLinks,
  removeDeadlineNotificationLink,
  serializeDeadlineNotificationLinks,
  upsertDeadlineNotificationLink,
} from "@features/notifications";

// 期限通知の予約対応表（{ planId → notificationId }）の AsyncStorage 実装。
// クラウドには置かない（data-model.md「期限通知の予約」）。

const LINKS_KEY = "notifications.deadline-links";

export const asyncStorageNotificationStorage: NotificationStorageRepository = {
  async getLink(planId: string): Promise<DeadlineNotificationLink | null> {
    const links = parseDeadlineNotificationLinks(
      await AsyncStorage.getItem(LINKS_KEY),
    );
    return findDeadlineNotificationLink(links, planId);
  },

  async saveLink(link: DeadlineNotificationLink): Promise<void> {
    const links = parseDeadlineNotificationLinks(
      await AsyncStorage.getItem(LINKS_KEY),
    );
    await AsyncStorage.setItem(
      LINKS_KEY,
      serializeDeadlineNotificationLinks(
        upsertDeadlineNotificationLink(links, link),
      ),
    );
  },

  async removeLink(planId: string): Promise<void> {
    const links = parseDeadlineNotificationLinks(
      await AsyncStorage.getItem(LINKS_KEY),
    );
    await AsyncStorage.setItem(
      LINKS_KEY,
      serializeDeadlineNotificationLinks(
        removeDeadlineNotificationLink(links, planId),
      ),
    );
  },
};
