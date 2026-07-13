import type { Plan, PlanDraft, PlanRepository } from "@features/plans";
import { supabase } from "@global/lib/supabase";

import { currentUserId } from "./currentUserId";
import { toInsertRow, toPlan, toUpdateRow } from "./supabasePlanMapping";

// owner / locked_by の表示名を FK 名の埋め込みで一緒に取得する。
// ペアの相手の profiles 行も RLS で select できるため、双方の名前を解決できる（#20）。
const PLAN_SELECT =
  "*, owner:profiles!plans_owner_id_fkey(display_name), locker:profiles!plans_locked_by_fkey(display_name)";

// Postgres の「uuid の構文エラー」。削除済みプランへの遷移（F-10）等で
// uuid でない id が来たときは「見つからない」と同義に扱う。
const INVALID_UUID_CODE = "22P02";

export const supabasePlanRepository: PlanRepository = {
  async list(): Promise<Plan[]> {
    // 並び・グループ化は純粋関数（features/plans/model/sections）が担うため、
    // ここでは同日作成の順序が安定するよう created_at 昇順にだけ揃える。
    const { data, error } = await supabase
      .from("plans")
      .select(PLAN_SELECT)
      .order("created_at", { ascending: true });
    if (error) {
      throw error;
    }
    return data.map(toPlan);
  },

  async get(id: string): Promise<Plan | null> {
    const { data, error } = await supabase
      .from("plans")
      .select(PLAN_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error) {
      if (error.code === INVALID_UUID_CODE) {
        return null;
      }
      throw error;
    }
    return data ? toPlan(data) : null;
  },

  async create(draft: PlanDraft): Promise<Plan> {
    const ownerId = await currentUserId();
    const { data, error } = await supabase
      .from("plans")
      .insert(toInsertRow(draft, ownerId))
      .select(PLAN_SELECT)
      .single();
    if (error) {
      throw error;
    }
    return toPlan(data);
  },

  async update(id: string, draft: PlanDraft): Promise<Plan> {
    const { data, error } = await supabase
      .from("plans")
      .update(toUpdateRow(draft))
      .eq("id", id)
      .select(PLAN_SELECT)
      .single();
    if (error) {
      throw error;
    }
    return toPlan(data);
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("plans").delete().eq("id", id);
    if (error) {
      throw error;
    }
  },

  async close(id: string, closedAt: string): Promise<Plan> {
    const { data, error } = await supabase
      .from("plans")
      .update({ closed_at: closedAt })
      .eq("id", id)
      .select(PLAN_SELECT)
      .single();
    if (error) {
      throw error;
    }
    return toPlan(data);
  },

  async acquireLock(id: string): Promise<void> {
    const userId = await currentUserId();
    // locked_at は端末時計。TTL 判定（model/editLock）も読む側の端末時計なので、
    // 多少のズレは TTL 5分に対して許容する（adr/0005）
    const { error } = await supabase
      .from("plans")
      .update({ locked_by: userId, locked_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      throw error;
    }
  },

  async releaseLock(id: string): Promise<void> {
    const userId = await currentUserId();
    // 自分の TTL 切れ後に相手が取り直したロックを消さないよう、保持者が自分の行だけ更新する
    const { error } = await supabase
      .from("plans")
      .update({ locked_by: null, locked_at: null })
      .eq("id", id)
      .eq("locked_by", userId);
    if (error) {
      throw error;
    }
  },
};
