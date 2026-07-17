import { describe, expect, it } from "@jest/globals";

import { buildBugReportDraft } from "./bugReport";

const BASE = {
  comment: "",
  logs: '{"ts":"2026-07-17T10:00:00.000Z","level":"info","event":"app_launch"}\n',
  appVersion: "1.0.0",
  osVersion: "26.0" as string | number,
  deviceModel: "iPhone 17 Pro",
};

describe("buildBugReportDraft", () => {
  it("コメントは trim して残す", () => {
    const draft = buildBugReportDraft({
      ...BASE,
      comment: "  カレンダー追加が反映されない  ",
    });
    expect(draft.comment).toBe("カレンダー追加が反映されない");
  });

  it("空欄・空白だけのコメントは null", () => {
    expect(buildBugReportDraft({ ...BASE, comment: "" }).comment).toBeNull();
    expect(
      buildBugReportDraft({ ...BASE, comment: "   \n" }).comment,
    ).toBeNull();
  });

  it("ログは生テキストのまま格納する", () => {
    expect(buildBugReportDraft(BASE).logs).toBe(BASE.logs);
  });

  it("メタデータを文字列に揃える（Platform.Version の number も許容）", () => {
    const draft = buildBugReportDraft({ ...BASE, osVersion: 26 });
    expect(draft).toMatchObject({
      appVersion: "1.0.0",
      osVersion: "26",
      deviceModel: "iPhone 17 Pro",
    });
  });

  it("取れないメタデータは unknown で埋める", () => {
    const draft = buildBugReportDraft({
      ...BASE,
      appVersion: undefined,
      osVersion: null,
      deviceModel: null,
    });
    expect(draft).toMatchObject({
      appVersion: "unknown",
      osVersion: "unknown",
      deviceModel: "unknown",
    });
  });
});
