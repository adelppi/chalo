// 期限通知の予約日時の算出・送らない条件・組み直し判定。純粋関数（adr/0014）。
// 仕様は docs/domain/notifications.md「2. 期限通知」を正とする。

import type { DeadlinePlanFields } from "./types";

/** 期限の何日前に知らせるか（2週間前。domain/notifications.md） */
const OFFSET_DAYS = 14;

/** 配信時刻：朝9:00（端末TZ。domain/notifications.md） */
const FIRE_HOUR = 9;

/** 期限（YYYY-MM-DD）の2週間前の朝9:00（端末TZ）を返す */
export function computeDeadlineNotificationFireDate(deadline: string): Date {
  const [year, month, day] = deadline.split("-").map(Number);
  // Date コンストラクタが日の繰り下がり（月・年またぎ）を解決する
  return new Date(year, month - 1, day - OFFSET_DAYS, FIRE_HOUR, 0, 0);
}

/**
 * 予約するかを判定する。送らない条件（domain/notifications.md）：
 * - 期限が入っていない
 * - すでに日付（行く予定日）が入っている
 * - 判定時点で期限まで2週間を切っている（＝発火日時が過去）
 */
export function shouldScheduleDeadlineNotification(
  plan: Pick<DeadlinePlanFields, "date" | "deadline">,
  now: Date,
): boolean {
  if (plan.deadline === null) {
    return false;
  }
  if (plan.date !== null) {
    return false;
  }
  return (
    computeDeadlineNotificationFireDate(plan.deadline).getTime() > now.getTime()
  );
}

/** 通知の文面とディープリンク先を組み立てる。期限なしは組み立てられないので null */
export function buildDeadlineNotificationContent(
  plan: Pick<DeadlinePlanFields, "id" | "title" | "deadline">,
): { title: string; body: string; url: string } | null {
  if (plan.deadline === null) {
    return null;
  }
  const [, month, day] = plan.deadline.split("-").map(Number);
  return {
    title: `「${plan.title}」の期限が近づいています`,
    body: `期限は${month}月${day}日です。そろそろ予定を決めませんか？`,
    url: `/plan/${plan.id}`,
  };
}

/**
 * 通知に影響する項目（タイトル・日付・期限）が変わったか。
 * 編集保存時、変わっていなければ予約を組み直さない。
 */
export function deadlineNotificationFieldsChanged(
  before: Pick<DeadlinePlanFields, "title" | "date" | "deadline">,
  after: Pick<DeadlinePlanFields, "title" | "date" | "deadline">,
): boolean {
  return (
    before.title !== after.title ||
    before.date !== after.date ||
    before.deadline !== after.deadline
  );
}

/** 通知データからディープリンク先 URL を取り出す。無い・不正なら null */
export function extractNotificationUrl(data: unknown): string | null {
  if (typeof data !== "object" || data === null) {
    return null;
  }
  const url = (data as { url?: unknown }).url;
  return typeof url === "string" && url.length > 0 ? url : null;
}
