import { describe, expect, it } from "@jest/globals";

import {
  combineTime,
  formatCalendarTitle,
  getCalendarWeeks,
  getHourWheelOptions,
  getMinuteWheelOptions,
  isPastDate,
  monthOf,
  shiftMonth,
  splitTime,
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

describe("getHourWheelOptions", () => {
  it("全25項目・先頭が「なし」、続けて00〜23時", () => {
    const options = getHourWheelOptions();
    expect(options.length).toBe(25);
    expect(options[0]).toEqual({ label: "なし", value: TIME_NONE });
    expect(options[1]).toEqual({ label: "00", value: "00" });
    expect(options[24]).toEqual({ label: "23", value: "23" });
  });
});

describe("getMinuteWheelOptions", () => {
  it("10分きざみの全6項目", () => {
    const options = getMinuteWheelOptions();
    expect(options.map((o) => o.value)).toEqual([
      "00",
      "10",
      "20",
      "30",
      "40",
      "50",
    ]);
  });
});

describe("combineTime / splitTime", () => {
  it("時が「なし」なら null になる", () => {
    expect(combineTime(TIME_NONE, "30")).toBeNull();
  });

  it("時・分から HH:MM を組み立てる", () => {
    expect(combineTime("14", "30")).toBe("14:30");
  });

  it("null からは「なし」・00分を得る", () => {
    expect(splitTime(null)).toEqual({ hour: TIME_NONE, minute: "00" });
  });

  it("HH:MM から時・分を得る", () => {
    expect(splitTime("09:40")).toEqual({ hour: "09", minute: "40" });
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
