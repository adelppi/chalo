import { formatDateFull } from "./format";
import { countPlanStatuses } from "./sections";
import { deriveClosedDate, derivePlanStatus } from "./status";
import type { Plan, PlanStatus } from "./types";

// プラン書き出しのテキスト整形（domain/pairing.md「書き出し / エクスポート」）。純粋関数（adr/0014）。
// 含める項目は domain/pairing.md の目安どおり:
// タイトル・ステータス・日付時刻・期限・場所・参考URL・メモ・作成者・おしまい日・作成日時。
// 場所の座標は v1 で入力 UI を持たず常に空のため、名称のみ出力する。

/** 書き出しファイル名（F-1b の文言と一致させる） */
export const EXPORT_FILE_NAME = "chalo-plans.txt";

const STATUS_LABELS: Record<PlanStatus, string> = {
  wish: "いつか",
  scheduled: "予定",
  done: "おしまい",
};

const SECTION_RULE = "----------------------------------------";

function planBlock(plan: Plan, now: Date): string {
  const status = derivePlanStatus(plan, now);
  const lines: string[] = [`・${plan.title}`];
  lines.push(`  ステータス: ${STATUS_LABELS[status]}`);
  if (plan.date) {
    lines.push(`  日付・時刻: ${formatDateFull(plan.date, plan.time)}`);
  }
  if (plan.deadline) {
    lines.push(`  期限: ${formatDateFull(plan.deadline)}`);
  }
  if (plan.placeName) {
    lines.push(`  場所: ${plan.placeName}`);
  }
  if (plan.referenceUrl) {
    lines.push(`  参考URL: ${plan.referenceUrl}`);
  }
  if (plan.memo) {
    // 複数行メモは2行目以降もラベル分だけ字下げして揃える
    lines.push(`  メモ: ${plan.memo.split("\n").join("\n        ")}`);
  }
  lines.push(`  作成者: ${plan.ownerName}`);
  if (status === "done") {
    const closedDate = deriveClosedDate(plan);
    if (closedDate) {
      lines.push(`  おしまい日: ${formatDateFull(closedDate)}`);
    }
  }
  lines.push(`  作成日: ${formatDateFull(plan.createdAt)}`);
  return lines.join("\n");
}

function section(title: string, blocks: string[]): string {
  return [SECTION_RULE, title, SECTION_RULE, "", blocks.join("\n\n")].join(
    "\n",
  );
}

function toDateOnly(now: Date): string {
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${mm}-${dd}`;
}

/**
 * 全プラン（自分＋相手、ソロなら自分のみ）を1つのテキストに連結する。
 * 「プラン」（未おしまい。作成順のまま）と「おしまい」（おしまい日の新しい順）に分けて並べる。
 */
export function buildPlansExportText(plans: Plan[], now: Date): string {
  const counts = countPlanStatuses(plans, now);
  const active = plans.filter((plan) => derivePlanStatus(plan, now) !== "done");
  const done = plans
    .filter((plan) => derivePlanStatus(plan, now) === "done")
    .sort((a, b) =>
      (deriveClosedDate(b) ?? "").localeCompare(deriveClosedDate(a) ?? ""),
    );

  const parts: string[] = [
    [
      "chalo プランの書き出し",
      `書き出し日: ${formatDateFull(toDateOnly(now))}`,
      `プラン ${counts.active}件・おしまい ${counts.done}件`,
    ].join("\n"),
  ];

  if (active.length > 0) {
    parts.push(
      section(
        `プラン（${counts.active}件）`,
        active.map((plan) => planBlock(plan, now)),
      ),
    );
  }
  if (done.length > 0) {
    parts.push(
      section(
        `おしまい（${counts.done}件）`,
        done.map((plan) => planBlock(plan, now)),
      ),
    );
  }
  if (plans.length === 0) {
    parts.push("プランはまだありません。");
  }

  return parts.join("\n\n") + "\n";
}
