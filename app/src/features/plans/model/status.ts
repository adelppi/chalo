import type { Plan, PlanStatus } from "./types";

// ステータス導出（docs/domain/plan-lifecycle.md）。
// done = closed_at あり、または予定日（時刻があればその時刻）の終わりを過ぎた。
// scheduled = 日付あり・未おしまい。wish = 日付なし・未おしまい。
// 判定は端末のタイムゾーン基準。

/** "YYYY-MM-DD"（+"HH:mm"）を端末ローカルの Date にする */
export function parseLocalDateTime(date: string, time?: string | null): Date {
  const [year, month, day] = date.split("-").map(Number);
  if (time) {
    const [hour, minute] = time.split(":").map(Number);
    return new Date(year, month - 1, day, hour, minute);
  }
  return new Date(year, month - 1, day);
}

/** 自動おしまいのしきい値。時刻ありはその時刻、なしはその日の終わり */
export function autoCloseThreshold(date: string, time: string | null): Date {
  if (time) {
    return parseLocalDateTime(date, time);
  }
  const endOfDay = parseLocalDateTime(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
}

export function derivePlanStatus(plan: Plan, now: Date): PlanStatus {
  if (plan.closedAt) {
    return "done";
  }
  if (plan.date) {
    if (now.getTime() > autoCloseThreshold(plan.date, plan.time).getTime()) {
      return "done";
    }
    return "scheduled";
  }
  return "wish";
}

/**
 * おしまい日の導出：closed_at ?? date（docs/data-model.md）。
 * 自動おしまいは closed_at を書き込まないため、無ければ予定日がおしまい日。
 */
export function deriveClosedDate(plan: Plan): string | null {
  return plan.closedAt ?? plan.date;
}
