import type { Plan, PlanDraft } from "@features/plans";
import type { Database } from "@global/lib/supabase";

// plans の行⇄ドメイン型マッピング。実装内に閉じる純粋関数（adr/0003・adr/0014）。

type PlanTable = Database["public"]["Tables"]["plans"];

/** profiles の埋め込み（display_name のみ）。RLS で読めない行は null になる */
type ProfileName = { display_name: string } | null;

/** list / get の select 結果行（owner / locker は FK 名で埋め込む） */
export type PlanRowWithNames = PlanTable["Row"] & {
  owner: ProfileName;
  locker: ProfileName;
};

/** Postgres の time（HH:MM:SS）→ ドメインの HH:mm */
export function toDomainTime(time: string | null): string | null {
  return time ? time.slice(0, 5) : null;
}

/** timestamptz の ISO 文字列 → 端末タイムゾーンの YYYY-MM-DD */
export function toLocalDateString(iso: string): string {
  const date = new Date(iso);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

/** 行 → ドメイン型 */
export function toPlan(row: PlanRowWithNames): Plan {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    time: toDomainTime(row.time),
    deadline: row.deadline,
    placeName: row.place_name,
    referenceUrl: row.reference_url,
    memo: row.memo,
    closedAt: row.closed_at,
    // ソロ RLS では自分のプランしか読めないため owner は常に自分の profile。
    // 万一 profiles 側の RLS で読めなかった場合は空欄で表示する。
    ownerName: row.owner?.display_name ?? "",
    lockedByName: row.locked_by ? (row.locker?.display_name ?? null) : null,
    createdAt: toLocalDateString(row.created_at),
  };
}

/** 作成フォーム → insert 行。ソロ時は pair_id を入れない（null のまま） */
export function toInsertRow(
  draft: PlanDraft,
  ownerId: string,
): PlanTable["Insert"] {
  return {
    owner_id: ownerId,
    title: draft.title,
    date: draft.date,
    time: draft.time,
    deadline: draft.deadline,
    reference_url: draft.referenceUrl,
    memo: draft.memo,
  };
}

/** 編集フォーム → update 行。フォームにない列（closed_at 等）は触らない */
export function toUpdateRow(draft: PlanDraft): PlanTable["Update"] {
  return {
    title: draft.title,
    date: draft.date,
    time: draft.time,
    deadline: draft.deadline,
    reference_url: draft.referenceUrl,
    memo: draft.memo,
  };
}
