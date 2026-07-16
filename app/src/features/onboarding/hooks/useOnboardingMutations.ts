import { useMutation, useQueryClient } from "@tanstack/react-query";

import { onboardingKeys } from "../data/queryKeys";
import { useOnboardingContext } from "./OnboardingProvider";

/** A3「名前の確認」の完了を記録する */
export function useConfirmName() {
  const { onboardingRepository } = useOnboardingContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => onboardingRepository.confirmName(),
    // invalidateQueries の戻り値を return する：呼び出し元（router.push 等）は
    // mutateAsync の解決を待って遷移するため、再取得の完了までここで待たせないと
    // ガード（needsOnboarding）が古い値のまま遷移してしまう（Issue #40）。
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: onboardingKeys.progress,
      });
    },
  });
}

/** オンボーディング完了を記録する（A4 スキップ／ペア成立の両方から呼ぶ） */
export function useCompleteOnboarding() {
  const { onboardingRepository } = useOnboardingContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => onboardingRepository.complete(),
    // 同上：戻り値の return が無いと再取得を待たずに resolve してしまう。
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: onboardingKeys.progress,
      });
    },
  });
}
