import type { Plan, PlanDraft, PlanRepository } from "@features/plans";
import { supabase } from "@global/lib/supabase";

import { currentUserId } from "./currentUserId";
import { toInsertRow, toPlan, toUpdateRow } from "./supabasePlanMapping";

// owner / locked_by の表示名を FK 名の埋め込みで一緒に取得する。
// ソロ RLS の間は owner = 自分なので常に解決できる（相手の profiles 行は読めない）。
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
};
