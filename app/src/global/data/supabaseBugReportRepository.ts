import type { BugReportDraft, BugReportRepository } from "@features/settings";
import { supabase } from "@global/lib/supabase";

import { currentUserId } from "./currentUserId";

// 不具合報告の Supabase 実装（adr/0003）。RLS は本人の insert 専用で、
// 読み出しはサポート（service role）のみ（data-model.md）。
export const supabaseBugReportRepository: BugReportRepository = {
  async submit(draft: BugReportDraft): Promise<void> {
    const userId = await currentUserId();
    const { error } = await supabase.from("bug_reports").insert({
      profile_id: userId,
      comment: draft.comment,
      logs: draft.logs,
      app_version: draft.appVersion,
      os_version: draft.osVersion,
      device_model: draft.deviceModel,
    });
    if (error) {
      throw error;
    }
  },
};
