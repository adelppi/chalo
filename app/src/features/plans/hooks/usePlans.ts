import { useQuery } from "@tanstack/react-query";

import { planKeys } from "../data/queryKeys";
import { usePlansContext } from "./PlansProvider";

/** プラン一覧の取得（ホーム・おしまい一覧・書き出し件数で使う） */
export function usePlans() {
  const { planRepository } = usePlansContext();
  return useQuery({
    queryKey: planKeys.all,
    queryFn: () => planRepository.list(),
  });
}
