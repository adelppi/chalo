import { describe, expect, it } from "@jest/globals";

import {
  buildCalendarEvent,
  calendarEventFieldsChanged,
  CALENDAR_SIGNATURE,
  canAddToCalendar,
} from "./event";
import type { CalendarPlanFields } from "./types";

const basePlan: CalendarPlanFields = {
  id: "plan-1",
  title: "水族館にいく",
  date: "2026-07-20",
  time: null,
  placeName: null,
  memo: null,
};

describe("canAddToCalendar", () => {
  it("日付があれば追加できる", () => {
    expect(canAddToCalendar({ date: "2026-07-20" })).toBe(true);
  });

  it("日付なしプランは追加不可（ボタン非活性）", () => {
    expect(canAddToCalendar({ date: null })).toBe(false);
  });
});

describe("buildCalendarEvent", () => {
  it("日付なしプランからは組み立てられない（null）", () => {
    expect(buildCalendarEvent({ ...basePlan, date: null })).toBeNull();
  });

  it("時刻なしは終日イベントになる", () => {
    const event = buildCalendarEvent(basePlan);
    expect(event).not.toBeNull();
    expect(event?.allDay).toBe(true);
    expect(event?.startDate).toEqual(new Date(2026, 6, 20));
    expect(event?.endDate).toEqual(new Date(2026, 6, 20, 23, 59, 59));
  });

  it("時刻ありは開始時刻から1時間のイベントになる", () => {
    const event = buildCalendarEvent({ ...basePlan, time: "10:30" });
    expect(event?.allDay).toBe(false);
    expect(event?.startDate).toEqual(new Date(2026, 6, 20, 10, 30));
    expect(event?.endDate).toEqual(new Date(2026, 6, 20, 11, 30));
  });

  it("タイトル・場所を渡す", () => {
    const event = buildCalendarEvent({
      ...basePlan,
      placeName: "葛西臨海公園",
    });
    expect(event?.title).toBe("水族館にいく");
    expect(event?.location).toBe("葛西臨海公園");
  });

  it("場所なしは location が null", () => {
    expect(buildCalendarEvent(basePlan)?.location).toBeNull();
  });

  it("メモなしでもメモ末尾の目印だけは入る", () => {
    expect(buildCalendarEvent(basePlan)?.notes).toBe(CALENDAR_SIGNATURE);
  });

  it("メモがあれば本文のあとに目印を付ける", () => {
    const event = buildCalendarEvent({ ...basePlan, memo: "チケットは前売り" });
    expect(event?.notes).toBe(`チケットは前売り\n\n${CALENDAR_SIGNATURE}`);
  });
});

describe("calendarEventFieldsChanged", () => {
  it("タイトル・日付・時刻・場所・メモのいずれかが変わったら true", () => {
    expect(
      calendarEventFieldsChanged(basePlan, { ...basePlan, title: "動物園" }),
    ).toBe(true);
    expect(
      calendarEventFieldsChanged(basePlan, { ...basePlan, date: "2026-08-01" }),
    ).toBe(true);
    expect(
      calendarEventFieldsChanged(basePlan, { ...basePlan, time: "09:00" }),
    ).toBe(true);
    expect(
      calendarEventFieldsChanged(basePlan, { ...basePlan, placeName: "上野" }),
    ).toBe(true);
    expect(
      calendarEventFieldsChanged(basePlan, { ...basePlan, memo: "追記" }),
    ).toBe(true);
  });

  it("イベントに影響しない編集（期限・URL 等）では false", () => {
    expect(calendarEventFieldsChanged(basePlan, { ...basePlan })).toBe(false);
  });
});
