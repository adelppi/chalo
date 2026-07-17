import { useMutation, useQueryClient } from "@tanstack/react-query";

import { log } from "@global/lib/logging";

import { planKeys } from "../data/queryKeys";
import type { PlanDraft } from "../model/types";
import { usePlansContext } from "./PlansProvider";

// 作成・更新・削除・おしまいの mutation フック。
// モック段階は invalidate による再取得のみ。楽観更新（adr/0003）は実データ接続時に足す。
// 成功時に操作イベントを端末内ログへ記録する（features.md 11.4。ID のみで本文は載せない）。

export function useCreatePlan() {
  const { planRepository } = usePlansContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: PlanDraft) => planRepository.create(draft),
    onSuccess: (plan) => {
      log("info", "plan_create", { ids: { planId: plan.id } });
      queryClient.invalidateQueries({ queryKey: planKeys.all });
    },
  });
}

export function useUpdatePlan(id: string) {
  const { planRepository } = usePlansContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: PlanDraft) => planRepository.update(id, draft),
    onSuccess: () => {
      log("info", "plan_update", { ids: { planId: id } });
      queryClient.invalidateQueries({ queryKey: planKeys.all });
    },
  });
}

export function useDeletePlan(id: string) {
  const { planRepository } = usePlansContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => planRepository.remove(id),
    onSuccess: () => {
      log("info", "plan_delete", { ids: { planId: id } });
      // 一覧だけを無効化する。詳細まで無効化すると、戻るアニメーション中に
      // 再取得が null を返して「見つかりません」（F-10）が一瞬映ってしまう
      queryClient.invalidateQueries({ queryKey: planKeys.all, exact: true });
    },
  });
}

export function useClosePlan(id: string) {
  const { planRepository } = usePlansContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (closedAt: string) => planRepository.close(id, closedAt),
    onSuccess: () => {
      log("info", "plan_close", { ids: { planId: id } });
      queryClient.invalidateQueries({ queryKey: planKeys.all });
    },
  });
}
