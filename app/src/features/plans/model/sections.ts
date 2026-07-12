import { formatMonthLabel } from "./format";
import { deriveClosedDate, derivePlanStatus } from "./status";
import type { Plan } from "./types";

// ホーム（C-1b）とおしまい一覧（D-4）の並び・グループ化。純粋関数（adr/0014）。

export type HomeSections = {
  /** つぎの予定（いちばん近い「予定」。マホガニーカードの主役） */
  next: Plan | null;
  /** 残りの「予定」（日付順） */
  upcoming: Plan[];
  /** いつかいく（日付なし。作成順） */
  wishes: Plan[];
};

function scheduledSortKey(plan: Plan): string {
  // ISO 形式なので文字列比較で日時順になる。時刻なしは同日の先頭に置く
  return `${plan.date}T${plan.time ?? "00:00"}`;
}

export function buildHomeSections(plans: Plan[], now: Date): HomeSections {
  const scheduled = plans
    .filter((plan) => derivePlanStatus(plan, now) === "scheduled")
    .sort((a, b) => scheduledSortKey(a).localeCompare(scheduledSortKey(b)));
  const wishes = plans
    .filter((plan) => derivePlanStatus(plan, now) === "wish")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return {
    next: scheduled[0] ?? null,
    upcoming: scheduled.slice(1),
    wishes,
  };
}

export type DoneMonthGroup = {
  /** 「2026年 7月」 */
  label: string;
  plans: Plan[];
};

/** おしまい一覧。おしまい日の新しい順に、月ごとへグループ化する */
export function groupDoneByMonth(plans: Plan[], now: Date): DoneMonthGroup[] {
  const done = plans
    .filter(
      (plan) =>
        derivePlanStatus(plan, now) === "done" && deriveClosedDate(plan),
    )
    .sort((a, b) =>
      (deriveClosedDate(b) as string).localeCompare(
        deriveClosedDate(a) as string,
      ),
    );

  const groups: DoneMonthGroup[] = [];
  for (const plan of done) {
    const label = formatMonthLabel(deriveClosedDate(plan) as string);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.plans.push(plan);
    } else {
      groups.push({ label, plans: [plan] });
    }
  }
  return groups;
}

/** 書き出しダイアログ（F-1b）の「プラン 12件・おしまい 8件」用の集計 */
export function countPlanStatuses(
  plans: Plan[],
  now: Date,
): { active: number; done: number } {
  let active = 0;
  let done = 0;
  for (const plan of plans) {
    if (derivePlanStatus(plan, now) === "done") {
      done += 1;
    } else {
      active += 1;
    }
  }
  return { active, done };
}
