import type { BugReportDraft } from "../model/bugReport";

// 不具合報告の Repository interface（adr/0003）。
// 「ログを送信」（9.8・F-1c）で端末内ログを bug_reports へ送る。
// 実装（supabase への insert）は global/data に置く。
export interface BugReportRepository {
  /** 送信1回で bug_reports に1行 insert する（data-model.md） */
  submit(draft: BugReportDraft): Promise<void>;
}
