// プラン→端末カレンダーイベントの変換と差分判定。純粋関数（adr/0014）。

import type { CalendarEventInput, CalendarPlanFields } from "./types";

/** メモ末尾の目印（domain/calendar.md。リンクが失われた時の判定にも使う） */
export const CALENDAR_SIGNATURE = "チャロが追加🐾";

/** 時刻ありイベントの長さ：1時間（domain/calendar.md [提案]） */
const TIMED_EVENT_DURATION_MS = 60 * 60 * 1000;

/** 日付なしプランは追加不可＝ボタン非活性（domain/calendar.md） */
export function canAddToCalendar(plan: Pick<CalendarPlanFields, "date">) {
  return plan.date !== null;
}

/**
 * プランからイベント内容を組み立てる。日付なしは組み立てられないので null。
 * 時刻なしは終日イベント。メモ末尾に目印を付ける。
 */
export function buildCalendarEvent(
  plan: CalendarPlanFields,
): CalendarEventInput | null {
  if (plan.date === null) {
    return null;
  }

  const notes = plan.memo
    ? `${plan.memo}\n\n${CALENDAR_SIGNATURE}`
    : CALENDAR_SIGNATURE;
  const [year, month, day] = plan.date.split("-").map(Number);

  if (plan.time !== null) {
    const [hour, minute] = plan.time.split(":").map(Number);
    const startDate = new Date(year, month - 1, day, hour, minute);
    return {
      title: plan.title,
      notes,
      location: plan.placeName,
      startDate,
      endDate: new Date(startDate.getTime() + TIMED_EVENT_DURATION_MS),
      allDay: false,
    };
  }

  return {
    title: plan.title,
    notes,
    location: plan.placeName,
    startDate: new Date(year, month - 1, day),
    // 終日イベントは同日の終わりまで（翌日 0:00 にすると2日にまたがって見える）
    endDate: new Date(year, month - 1, day, 23, 59, 59),
    allDay: true,
  };
}

/**
 * イベントに影響する項目（タイトル・日付・時刻・場所・メモ）が変わったか。
 * 連携済みプランの編集時、変わっていなければ端末カレンダーを触らない。
 */
export function calendarEventFieldsChanged(
  before: CalendarPlanFields,
  after: CalendarPlanFields,
): boolean {
  return (
    before.title !== after.title ||
    before.date !== after.date ||
    before.time !== after.time ||
    before.placeName !== after.placeName ||
    before.memo !== after.memo
  );
}
