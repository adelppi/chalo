import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@global/store/useAuthStore";

import { planKeys } from "../data/queryKeys";
import { canStartEditing, evaluateEditLock } from "../model/editLock";
import { usePlansContext } from "./PlansProvider";

export type StartEditingResult =
  { type: "acquired" } | { type: "locked" } | { type: "not-found" };

/**
 * 編集ボタン押下時のロック取得フロー（adr/0005）。
 * その1件だけ最新取得 → ロック判定 → 空いていれば自分のロックを立てる。
 * 相手がロック中（TTL 内）・削除済みなら、詳細キャッシュを最新に更新して
 * 詳細画面を F-9（編集ロック）／F-10（見つからない）へ切り替える。
 */
export function useStartEditing(id: string) {
  const { planRepository } = usePlansContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<StartEditingResult> => {
      const userId = useAuthStore.getState().userId;
      if (!userId) {
        throw new Error("サインインしていません。");
      }

      // キャッシュではなく「押した瞬間」の1件を見る（adr/0004・adr/0005）
      const plan = await planRepository.get(id);
      if (!plan) {
        // 詳細画面を「見つかりません」（F-10）へ切り替える
        queryClient.setQueryData(planKeys.detail(id), null);
        return { type: "not-found" };
      }

      const state = evaluateEditLock({
        lockedBy: plan.lockedBy,
        lockedAt: plan.lockedAt,
        userId,
        now: new Date(),
      });
      if (!canStartEditing(state)) {
        // 最新のロック済みプランを詳細キャッシュへ反映すると、
        // 詳細画面が編集ロック画面（F-9）へ切り替わる
        queryClient.setQueryData(planKeys.detail(id), plan);
        return { type: "locked" };
      }

      await planRepository.acquireLock(id);
      return { type: "acquired" };
    },
  });
}
