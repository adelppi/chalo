import { useQuery } from "@tanstack/react-query";

import { settingsKeys } from "../data/queryKeys";
import { useSettingsContext } from "./SettingsProvider";

/** 設定画面のプロフィール表示（あなたの名前・相手のよびかた） */
export function useProfileSettings() {
  const { settingsRepository } = useSettingsContext();
  return useQuery({
    queryKey: settingsKeys.profile,
    queryFn: () => settingsRepository.getProfileSettings(),
  });
}
