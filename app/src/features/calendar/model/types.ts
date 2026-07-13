// カレンダー連携のドメイン型（docs/domain/calendar.md・adr/0012）。

/** プラン↔端末イベントの対応。クラウドに持たず端末ローカルに保持する（adr/0012） */
export type CalendarLink = {
  planId: string;
  eventId: string;
  calendarId: string;
};

/** イベントの元になるプランの項目。plans feature へ依存しないための最小の写し */
export type CalendarPlanFields = {
  id: string;
  title: string;
  /** 行く予定日 YYYY-MM-DD。null なら追加不可（domain/calendar.md） */
  date: string | null;
  /** 時刻 HH:mm。null なら終日イベント */
  time: string | null;
  placeName: string | null;
  memo: string | null;
};

/** 端末カレンダーに渡すイベント内容（domain/calendar.md「カレンダーイベントに渡す内容」） */
export type CalendarEventInput = {
  title: string;
  notes: string;
  location: string | null;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
};

/** 端末のカレンダー（追加先プロファイルの候補） */
export type DeviceCalendar = {
  id: string;
  title: string;
  color: string | null;
  /** 書き込めるカレンダーだけを追加先の候補にする */
  allowsModifications: boolean;
};

export type CalendarPermission = "granted" | "denied" | "undetermined";
