// 日付表示の整形（Claude Design の表記に合わせる）。すべて純粋関数（adr/0014）。

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

function parts(date: string): { month: number; day: number; weekday: string } {
  const [year, month, day] = date.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()];
  return { month, day, weekday };
}

/** 「7月12日（日）10:00」（時刻なしなら「7月19日（日）」） */
export function formatDateLong(date: string, time?: string | null): string {
  const { month, day, weekday } = parts(date);
  const base = `${month}月${day}日（${weekday}）`;
  return time ? `${base}${time}` : base;
}

/** 「2026年7月12日（日）10:00」（書き出しなど年が要る場面。時刻なしなら日付のみ） */
export function formatDateFull(date: string, time?: string | null): string {
  const [year] = date.split("-").map(Number);
  const { month, day, weekday } = parts(date);
  const base = `${year}年${month}月${day}日（${weekday}）`;
  return time ? `${base}${time}` : base;
}

/** 「7/12（日）10:00」（編集画面の行の値） */
export function formatDateShort(date: string, time?: string | null): string {
  const { month, day, weekday } = parts(date);
  const base = `${month}/${day}（${weekday}）`;
  return time ? `${base}${time}` : base;
}

/** 「7/21 まで」（いつかいく の期限チップ） */
export function formatDeadlineLabel(deadline: string): string {
  const { month, day } = parts(deadline);
  return `${month}/${day} まで`;
}

/** 「7月12日に おしまい」（おしまい一覧の行） */
export function formatClosedLabel(closedDate: string): string {
  const { month, day } = parts(closedDate);
  return `${month}月${day}日に おしまい`;
}

/** 「2026年 7月」（おしまい一覧の月見出し） */
export function formatMonthLabel(date: string): string {
  const [year, month] = date.split("-").map(Number);
  return `${year}年 ${month}月`;
}

/** 「ゆい が 6月30日に作成しました」（プラン詳細の作成者行） */
export function formatCreatedByLabel(
  ownerName: string,
  createdAt: string,
): string {
  const { month, day } = parts(createdAt);
  return `${ownerName} が ${month}月${day}日に作成しました`;
}
