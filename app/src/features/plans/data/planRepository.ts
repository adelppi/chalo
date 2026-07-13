import type { Plan, PlanDraft } from "../model/types";

// プランの Repository interface（adr/0003）。
// feature はこの抽象にだけ依存する。実装（モック段階では in-memory フェイク、
// 将来は Supabase）は global/data に置き、合成ルートで結線する（adr/0015）。
export interface PlanRepository {
  list(): Promise<Plan[]>;

  /** 見つからなければ null（削除済みプランへの遷移 = F-10） */
  get(id: string): Promise<Plan | null>;

  create(draft: PlanDraft): Promise<Plan>;

  update(id: string, draft: PlanDraft): Promise<Plan>;

  remove(id: string): Promise<void>;

  /** 手動おしまい。closedAt は押した日（YYYY-MM-DD） */
  close(id: string, closedAt: string): Promise<Plan>;

  /** 編集ロックを立てる（自分が保持者になる。adr/0005） */
  acquireLock(id: string): Promise<void>;

  /** 自分が保持しているロックだけを解除する（相手のロックは触らない） */
  releaseLock(id: string): Promise<void>;
}
