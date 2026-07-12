// 日時ピッカー（C-3b）のカレンダー計算。純粋関数（adr/0014）。

export type CalendarMonth = {
  year: number;
  /** 1〜12 */
  month: number;
};

/** 月のカレンダー行列（日曜はじまり）。月外のマスは null */
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
  while (cells.length % 7 !== 0) {
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
