import { describe, expect, it } from "@jest/globals";

import {
  formatCalendarTitle,
  getCalendarWeeks,
  monthOf,
  shiftMonth,
  toDateString,
} from "./calendar";

describe("getCalendarWeeks", () => {
  it("2026年7月は水曜はじまり・31日", () => {
    const weeks = getCalendarWeeks(2026, 7);
    expect(weeks[0]).toEqual([null, null, null, 1, 2, 3, 4]);
    expect(weeks[weeks.length - 1]).toContain(31);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
  });

  it("うるう年の2月", () => {
    const weeks = getCalendarWeeks(2028, 2);
    const days = weeks.flat().filter((d) => d !== null);
    expect(days.length).toBe(29);
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
