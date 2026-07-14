// notifications feature の公開 API（バレル）。外部はここ経由でのみ参照する（adr/0015）。

export { NotificationPermissionRow } from "./components/NotificationPermissionRow";

export { NotificationsProvider } from "./hooks/NotificationsProvider";
export {
  useNotificationPermission,
  useRequestNotificationPermission,
} from "./hooks/useNotificationPermission";
// plans feature が作成・編集保存後の予約の組み直し、プラン削除時の取り消しに使う
export {
  useCancelDeadlineNotification,
  useSyncDeadlineNotification,
} from "./hooks/useDeadlineNotificationMutations";
export { useNotificationObserver } from "./hooks/useNotificationObserver";
export { deadlineNotificationFieldsChanged } from "./model/deadline";

// データ契約（Repository interface とドメイン型）。global/data の実装が参照する。
export type {
  DeviceNotificationRepository,
  NotificationStorageRepository,
} from "./data";
export { extractNotificationUrl } from "./model/deadline";
export {
  findDeadlineNotificationLink,
  parseDeadlineNotificationLinks,
  removeDeadlineNotificationLink,
  serializeDeadlineNotificationLinks,
  upsertDeadlineNotificationLink,
} from "./model/links";
export type {
  DeadlineNotificationInput,
  DeadlineNotificationLink,
  DeadlinePlanFields,
  NotificationPermission,
} from "./model/types";
