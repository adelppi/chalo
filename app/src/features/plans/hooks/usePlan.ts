import { useQuery } from "@tanstack/react-query";

import { planKeys } from "../data/queryKeys";
import { usePlansContext } from "./PlansProvider";

/** プラン1件の取得。削除済みなら null（F-10 の分岐に使う） */
export function usePlan(id: string) {
  const { planRepository } = usePlansContext();
  return useQuery({
    queryKey: planKeys.detail(id),
    queryFn: () => planRepository.get(id),
  });
}
