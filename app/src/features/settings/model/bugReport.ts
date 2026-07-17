// 不具合報告の送信ペイロード整形（9.8・adr/0011）。純粋関数（adr/0014）。

/** bug_reports 1行分の内容（送信1回で1行。data-model.md） */
export type BugReportDraft = {
  /** 送信時に添えた症状。空欄なら null */
  comment: string | null;
  /** 端末の NDJSON ログ全文（最大30日 / 2MB） */
  logs: string;
  appVersion: string;
  osVersion: string;
  deviceModel: string;
};

export type BugReportInput = {
  comment: string;
  logs: string;
  /** expo-constants の版。取れない環境では null */
  appVersion: string | null | undefined;
  /** Platform.Version。iOS では文字列だが型上は number もありうる */
  osVersion: string | number | null | undefined;
  /** expo-device の modelName。シミュレータ等では null */
  deviceModel: string | null | undefined;
};

/** 入力を bug_reports の1行へ整形する。コメントは trim して空なら null */
export function buildBugReportDraft(input: BugReportInput): BugReportDraft {
  const comment = input.comment.trim();
  return {
    comment: comment.length > 0 ? comment : null,
    logs: input.logs,
    appVersion: input.appVersion ?? "unknown",
    osVersion:
      input.osVersion !== null && input.osVersion !== undefined
        ? String(input.osVersion)
        : "unknown",
    deviceModel: input.deviceModel ?? "unknown",
  };
}
