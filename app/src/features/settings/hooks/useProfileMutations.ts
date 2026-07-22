import { useMutation, useQueryClient } from "@tanstack/react-query";

import { pairingKeys } from "@features/pairing";
import { planKeys } from "@features/plans";

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

/** 「相手のよびかた」の更新（E-1）。null で未設定に戻す（domain/pairing.md） */
export function useUpdatePartnerNickname() {
  const { settingsRepository } = useSettingsContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (partnerNickname: string | null) =>
      settingsRepository.updatePartnerNickname(partnerNickname),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile });
      // 相手の名前はデータ層で解決している（domain/pairing.md）。よびかたを変えたら、
      // それを含んで取得済みのキャッシュをまとめて読み直す。
      // ペア状態（設定のペア行・通知プライミング・削除確認）と、
      // プラン（詳細の作成者行・ロック画面・書き出し。planKeys.all は詳細にも前方一致する）。
      queryClient.invalidateQueries({ queryKey: pairingKeys.state });
      queryClient.invalidateQueries({ queryKey: planKeys.all });
    },
  });
}
