import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@global/store/useAuthStore";

import { planKeys } from "../data/queryKeys";
import { canStartEditing, evaluateEditLock } from "../model/editLock";
import { usePlansContext } from "./PlansProvider";

export type StartEditingResult =
  | { type: "acquired" }
  | { type: "locked"; lockedByName: string }
  | { type: "not-found" };

/**
 * 編集ボタン押下時のロック取得フロー（adr/0005）。
 * その1件だけ最新取得 → ロック判定 → 空いていれば自分のロックを立てる。
 * 相手がロック中（TTL 内）なら立てずに locked を返す。
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
        return { type: "not-found" };
      }

      const state = evaluateEditLock({
        lockedBy: plan.lockedBy,
        lockedAt: plan.lockedAt,
        userId,
        now: new Date(),
      });
      if (!canStartEditing(state)) {
        // ロック画面（F-9）が最新の内容を映せるようキャッシュへ反映しておく。
        // 表示名が読めなかったときも文言が壊れないようフォールバック
        queryClient.setQueryData(planKeys.detail(id), plan);
        return { type: "locked", lockedByName: plan.lockedByName ?? "相手" };
      }

      await planRepository.acquireLock(id);
      return { type: "acquired" };
    },
    onSuccess: (result) => {
      if (result.type === "not-found") {
        // 詳細画面を「見つかりません」（F-10）へ切り替える
        queryClient.setQueryData(planKeys.detail(id), null);
      }
    },
  });
}
