import { useQuery } from "@tanstack/react-query";

import { pairingKeys } from "../data/queryKeys";
import { usePairingContext } from "./PairingProvider";

/** ペア状態の取得（設定 E-1/E-1b の出し分け・B 系画面で使う） */
export function usePairState() {
  const { pairingRepository } = usePairingContext();
  return useQuery({
    queryKey: pairingKeys.state,
    queryFn: () => pairingRepository.getPairState(),
  });
}
