import { useMutation, useQueryClient } from "@tanstack/react-query";

import { pairingKeys } from "../data/queryKeys";
import { usePairingContext } from "./PairingProvider";

/** 招待コードの発行（再発行で前のコードは失効。domain/pairing.md） */
export function useIssueInviteCode() {
  const { pairingRepository } = usePairingContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => pairingRepository.issueInviteCode(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pairingKeys.state });
    },
  });
}

/** 相手のコードを入力してペア成立（B-3。失敗は PairingCodeError） */
export function useRedeemInviteCode() {
  const { pairingRepository } = usePairingContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => pairingRepository.redeemInviteCode(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pairingKeys.state });
    },
  });
}
