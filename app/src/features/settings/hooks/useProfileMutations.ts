import { useMutation, useQueryClient } from "@tanstack/react-query";

import { pairingKeys } from "@features/pairing";

import { settingsKeys } from "../data/queryKeys";
import { useSettingsContext } from "./SettingsProvider";

/** 「あなたの名前」の更新（E-1・A3 の両方から使う） */
export function useUpdateDisplayName() {
  const { settingsRepository } = useSettingsContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (displayName: string) =>
      settingsRepository.updateDisplayName(displayName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile });
      // ペア成立お祝い等に表示する自分の表示名も更新する（pairState 側にキャッシュされている）。
      queryClient.invalidateQueries({ queryKey: pairingKeys.state });
    },
  });
}

/** 「相手のよびかた」の更新（E-1） */
export function useUpdatePartnerNickname() {
  const { settingsRepository } = useSettingsContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (partnerNickname: string) =>
      settingsRepository.updatePartnerNickname(partnerNickname),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile });
    },
  });
}
