// 日時ピッカー（C-3b）のカレンダー計算。純粋関数（adr/0014）。

export type CalendarMonth = {
  year: number;
  /** 1〜12 */
  month: number;
};

/** カレンダーの行数（週数）。月によらず固定し、ピッカーの高さをがたつかせない（Issue #58） */
const WEEK_ROWS = 6;

/** 月のカレンダー行列（日曜はじまり・常に6行）。月外のマスは null */
export function getCalendarWeeks(
  year: number,
  month: number,
): (number | null)[][] {
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length < WEEK_ROWS * 7) {
    cells.push(null);
  }

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function shiftMonth(
  { year, month }: CalendarMonth,
  delta: number,
): CalendarMonth {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

/** 「2026年 7月」（ピッカーの月見出し） */
export function formatCalendarTitle({ year, month }: CalendarMonth): string {
  return `${year}年 ${month}月`;
}

/** YYYY-MM-DD へ整形 */
export function toDateString(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

/** "YYYY-MM-DD" からピッカー初期表示の月を得る */
export function monthOf(date: string): CalendarMonth {
  const [year, month] = date.split("-").map(Number);
  return { year, month };
}

/** 時刻ダイヤルで「時刻なし」を表す値（time = null に対応。Issue #58） */
export const TIME_NONE = "none";

export type TimeWheelOption = { label: string; value: string };

/**
 * 時ダイヤルの選択肢（全25項目）。先頭が「なし」、続けて 00〜23 時（Issue #58 フォローアップ）。
 * 「なし」を選ぶと分の値によらず time = null になる。
 */
export function getHourWheelOptions(): TimeWheelOption[] {
  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0"),
  );
  return [
    { label: "なし", value: TIME_NONE },
    ...hours.map((value) => ({ label: value, value })),
  ];
}

/** 分ダイヤルの選択肢（10分きざみ・全6項目。Issue #58 フォローアップ） */
export function getMinuteWheelOptions(): TimeWheelOption[] {
  return ["00", "10", "20", "30", "40", "50"].map((value) => ({
    label: value,
    value,
  }));
}

/** 時・分ダイヤルの値から time("HH:MM" または null)を組み立てる。時が「なし」なら null */
export function combineTime(hour: string, minute: string): string | null {
  return hour === TIME_NONE ? null : `${hour}:${minute}`;
}

/** time("HH:MM" または null)からダイヤルの初期値(時・分)を得る */
export function splitTime(time: string | null): {
  hour: string;
  minute: string;
} {
  if (time === null) {
    return { hour: TIME_NONE, minute: "00" };
  }
  const [hour, minute] = time.split(":");
  return { hour, minute };
}

/**
 * 過去日付か（"YYYY-MM-DD" のゼロ埋め文字列比較。today 当日は過去に含まない）。
 * 今日の日付を引数で受けることでテストから固定できる（Issue #58）。
 */
export function isPastDate(date: string, today: string): boolean {
  return date < today;
}
