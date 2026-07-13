// calendar feature の公開 API（バレル）。外部はここ経由でのみ参照する（adr/0015）。

export {
  CalendarPermissionRow,
  DefaultCalendarRow,
} from "./components/CalendarSettingsRows";
export { PlanCalendarButton } from "./components/PlanCalendarButton";

export { CalendarProvider } from "./hooks/CalendarProvider";
// plans feature が編集保存後の自動更新・プラン削除時の自動削除に使う
export {
  useRemovePlanFromCalendar,
  useSyncPlanToCalendar,
} from "./hooks/useCalendarMutations";
export { calendarEventFieldsChanged } from "./model/event";

// データ契約（Repository interface とドメイン型）。global/data の実装が参照する。
export type {
  CalendarStorageRepository,
  DeviceCalendarRepository,
} from "./data";
export {
  findCalendarLink,
  parseCalendarLinks,
  removeCalendarLink,
  serializeCalendarLinks,
  upsertCalendarLink,
} from "./model/links";
export type {
  CalendarEventInput,
  CalendarLink,
  CalendarPermission,
  CalendarPlanFields,
  DeviceCalendar,
} from "./model/types";
