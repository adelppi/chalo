// 作成・編集フォーム（C-3 / D-2）の入力値の整形と、未保存の変更の判定。
// 純粋関数（adr/0014）。

import type { Plan, PlanDraft } from "./types";

/** 作成フォームの初期値（何も入っていない状態） */
export const EMPTY_PLAN_DRAFT: PlanDraft = {
  title: "",
  date: null,
  time: null,
  deadline: null,
  referenceUrl: null,
  memo: null,
};

/**
 * 入力値を「保存する形」に整える。
 * - タイトルは前後の空白を落とす
 * - 時刻は日付があるときだけ意味を持つ（domain/plan-lifecycle.md）
 * - 期限は日付が入っているあいだ持てない（Issue #58）
 */
export function normalizePlanDraft(input: PlanDraft): PlanDraft {
  const date = input.date;
  return {
    title: input.title.trim(),
    date,
    time: date ? input.time : null,
    deadline: date ? null : input.deadline,
    referenceUrl: input.referenceUrl,
    memo: input.memo,
  };
}

/** 編集フォームの初期値（いま保存されているプランの値） */
export function planToDraft(plan: Plan): PlanDraft {
  return normalizePlanDraft({
    title: plan.title,
    date: plan.date,
    time: plan.time,
    deadline: plan.deadline,
    referenceUrl: plan.referenceUrl,
    memo: plan.memo,
  });
}

/**
 * 未保存の変更があるか（戻るときに保存を確認するかの判定。Issue #95）。
 * どちらも normalizePlanDraft を通した値で比べる。
 */
export function planDraftChanged(
  initial: PlanDraft,
  current: PlanDraft,
): boolean {
  return (
    initial.title !== current.title ||
    initial.date !== current.date ||
    initial.time !== current.time ||
    initial.deadline !== current.deadline ||
    initial.referenceUrl !== current.referenceUrl ||
    initial.memo !== current.memo
  );
}
