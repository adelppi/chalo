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

/** 時刻ホイールで「時刻なし」を表す値（time = null に対応。Issue #58） */
export const TIME_NONE = "none";

export type TimeWheelOption = { label: string; value: string };

/** 30分きざみの時刻を HH:MM で返す（0〜47 → 00:00〜23:30） */
function formatTimeSlot(index: number): string {
  const hour = String(Math.floor(index / 2)).padStart(2, "0");
  const minute = index % 2 === 0 ? "00" : "30";
  return `${hour}:${minute}`;
}

/**
 * 時刻ホイールの選択肢（全49項目）。0:00〜11:30 → なし → 12:00〜23:30 の並びにし、
 * よく使う「なし」を中央に置く（Issue #58）。
 */
export function getTimeWheelOptions(): TimeWheelOption[] {
  const morning = Array.from({ length: 24 }, (_, i) => formatTimeSlot(i));
  const afternoon = Array.from({ length: 24 }, (_, i) =>
    formatTimeSlot(i + 24),
  );
  return [
    ...morning.map((value) => ({ label: value, value })),
    { label: "なし", value: TIME_NONE },
    ...afternoon.map((value) => ({ label: value, value })),
  ];
}

/**
 * 過去日付か（"YYYY-MM-DD" のゼロ埋め文字列比較。today 当日は過去に含まない）。
 * 今日の日付を引数で受けることでテストから固定できる（Issue #58）。
 */
export function isPastDate(date: string, today: string): boolean {
  return date < today;
}
