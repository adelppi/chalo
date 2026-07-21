import { describe, expect, it } from "@jest/globals";

import {
  formatCalendarTitle,
  getCalendarWeeks,
  getTimeWheelOptions,
  isPastDate,
  monthOf,
  shiftMonth,
  TIME_NONE,
  toDateString,
} from "./calendar";

describe("getCalendarWeeks", () => {
  it("2026年7月は水曜はじまり・31日", () => {
    const weeks = getCalendarWeeks(2026, 7);
    expect(weeks[0]).toEqual([null, null, null, 1, 2, 3, 4]);
    expect(weeks.flat()).toContain(31);
  });

  it("うるう年の2月", () => {
    const weeks = getCalendarWeeks(2028, 2);
    const days = weeks.flat().filter((d) => d !== null);
    expect(days.length).toBe(29);
  });

  it("月によらず常に6行を返す（ピッカーの高さをがたつかせない。Issue #58）", () => {
    // 2026年2月は4週で収まる月、2026年8月は6週にまたがる月
    expect(getCalendarWeeks(2026, 2).length).toBe(6);
    expect(getCalendarWeeks(2026, 8).length).toBe(6);
    expect(getCalendarWeeks(2026, 2).every((week) => week.length === 7)).toBe(
      true,
    );
  });
});

describe("getTimeWheelOptions", () => {
  it("全49項目・0:00〜11:30 → なし → 12:00〜23:30 の並び", () => {
    const options = getTimeWheelOptions();
    expect(options.length).toBe(49);
    expect(options[0]).toEqual({ label: "00:00", value: "00:00" });
    expect(options[23]).toEqual({ label: "11:30", value: "11:30" });
    expect(options[24]).toEqual({ label: "なし", value: TIME_NONE });
    expect(options[25]).toEqual({ label: "12:00", value: "12:00" });
    expect(options[48]).toEqual({ label: "23:30", value: "23:30" });
  });
});

describe("isPastDate", () => {
  it("today より前なら過去", () => {
    expect(isPastDate("2026-07-21", "2026-07-22")).toBe(true);
  });

  it("today 当日は過去に含まない", () => {
    expect(isPastDate("2026-07-22", "2026-07-22")).toBe(false);
  });

  it("today より後は過去ではない", () => {
    expect(isPastDate("2026-07-23", "2026-07-22")).toBe(false);
  });
});

describe("shiftMonth", () => {
  it("年をまたいで進む・戻る", () => {
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({
      year: 2027,
      month: 1,
    });
    expect(shiftMonth({ year: 2026, month: 1 }, -1)).toEqual({
      year: 2025,
      month: 12,
    });
  });
});

describe("formatCalendarTitle / toDateString / monthOf", () => {
  it("表示と変換", () => {
    expect(formatCalendarTitle({ year: 2026, month: 7 })).toBe("2026年 7月");
    expect(toDateString(2026, 7, 5)).toBe("2026-07-05");
    expect(monthOf("2026-07-12")).toEqual({ year: 2026, month: 7 });
  });
});
