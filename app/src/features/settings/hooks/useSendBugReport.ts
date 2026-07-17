import { useMutation } from "@tanstack/react-query";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";

import { log, readLogsForReport } from "@global/lib/logging";

import { buildBugReportDraft } from "../model/bugReport";
import { useSettingsContext } from "./SettingsProvider";

// 不具合報告・ログ送信（9.8・F-1c・adr/0011）。
// バッファをフラッシュ→端末の NDJSON（最大30日 / 2MB）を読み、メタデータと
// 任意コメントを添えて bug_reports に1行 insert する。
export function useSendBugReport() {
  const { bugReportRepository } = useSettingsContext();

  return useMutation({
    mutationFn: (comment: string) =>
      bugReportRepository.submit(
        buildBugReportDraft({
          comment,
          logs: readLogsForReport(),
          appVersion: Constants.expoConfig?.version,
          osVersion: Platform.Version,
          deviceModel: Device.modelName,
        }),
      ),
    onSuccess: () => {
      log("info", "bug_report_sent");
    },
  });
}
