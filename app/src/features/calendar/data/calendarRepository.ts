import type {
  CalendarEventInput,
  CalendarLink,
  CalendarPermission,
  DeviceCalendar,
} from "../model/types";

// カレンダー連携の Repository interface（adr/0003 の流儀）。
// feature はこの抽象にだけ依存する。実装（expo-calendar・AsyncStorage）は
// global/data に置き、合成ルートで結線する（adr/0015）。

/** 端末カレンダー（EventKit）の操作 */
export interface DeviceCalendarRepository {
  getPermission(): Promise<CalendarPermission>;

  /** OS の許可ダイアログを出す（出せるのは実質1回。domain/onboarding.md） */
  requestPermission(): Promise<CalendarPermission>;

  /** 書き込めるイベント用カレンダーの一覧（追加先の候補） */
  listCalendars(): Promise<DeviceCalendar[]>;

  /** 端末のデフォルトカレンダー。取得できなければ null */
  getSystemDefaultCalendarId(): Promise<string | null>;

  /** イベントを作成して eventId を返す */
  createEvent(calendarId: string, event: CalendarEventInput): Promise<string>;

  updateEvent(eventId: string, event: CalendarEventInput): Promise<void>;

  deleteEvent(eventId: string): Promise<void>;

  /** イベントが残っているか（外部で手動削除された検知に使う） */
  eventExists(eventId: string): Promise<boolean>;
}

/** 端末ローカルの保存（カレンダーリンク・既定カレンダー設定。adr/0012） */
export interface CalendarStorageRepository {
  getLink(planId: string): Promise<CalendarLink | null>;

  saveLink(link: CalendarLink): Promise<void>;

  removeLink(planId: string): Promise<void>;

  /** 設定画面で選んだ既定カレンダー。未選択なら null */
  getDefaultCalendarId(): Promise<string | null>;

  setDefaultCalendarId(calendarId: string): Promise<void>;
}
