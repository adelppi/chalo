import { useMutation } from "@tanstack/react-query";

import {
  buildPlansExportText,
  EXPORT_FILE_NAME,
  type Plan,
} from "@features/plans";

import { useSettingsContext } from "./SettingsProvider";

// プランの書き出し（F-1b・domain/pairing.md「書き出し / エクスポート」）。
// 全プランを1つのテキストに整形し、.txt にして iOS 共有シートへ渡す。
// 設定とロック画面（partner-left）で同じ実装を使う。
export function useExportPlans() {
  const { fileShareRepository } = useSettingsContext();

  return useMutation({
    mutationFn: (plans: Plan[]) =>
      fileShareRepository.shareTextFile(
        EXPORT_FILE_NAME,
        buildPlansExportText(plans, new Date()),
      ),
  });
}
