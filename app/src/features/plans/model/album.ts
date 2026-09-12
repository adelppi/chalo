import type { DateRange } from "@features/album";

import { parseLocalDateTime } from "./status";
import type { Plan } from "./types";

// アルバム対象日と、そこから引く写真の抽出区間（docs/domain/plan-lifecycle.md
// 「おしまい日とアルバム対象日の一致について」）。
// album feature は Plan を知らないので、Plan → 区間の変換は plans 側に置く（adr/0015）。

/**
 * アルバム対象日（思い出基準日）＝ 予定日 else おしまい日。
 *
 * 標準フローでは両者は一致する。日付ありプランを予定日より前に手動で
 * おしまいにした場合だけズレ、そのときは「行こうとしていた日」を優先する。
 * 日付もおしまい日も無い（＝まだおしまいでない）プランは null。
 */
export function deriveAlbumDate(plan: Plan): string | null {
  return plan.date ?? plan.closedAt;
}

/**
 * アルバム対象日の1日ぶんの抽出区間（端末のタイムゾーン基準）。
 * 抽出キーは撮影日付のみで、時刻では絞らない（domain/album.md「抽出ルール」）。
 */
export function derivePlanAlbumRange(plan: Plan): DateRange | null {
  const date = deriveAlbumDate(plan);
  if (!date) {
    return null;
  }
  const from = parseLocalDateTime(date);
  const to = parseLocalDateTime(date);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}
