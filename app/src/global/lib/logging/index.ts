// 端末内ログ（adr/0011）。横断インフラのため global に置き、supabase には
// 依存しない。送信（bug_reports への insert）は BugReportRepository が担う。

export { flushLogs, log, readLogsForReport, setupLogging } from "./logger";
export { buildScreenViewFields } from "./sanitize";
export type { LogFields, LogLevel } from "./types";
