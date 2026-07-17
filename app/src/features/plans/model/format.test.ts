import { describe, expect, it } from "@jest/globals";

import {
  formatClosedLabel,
  formatCreatedByLabel,
  formatDateLong,
  formatDateShort,
  formatDeadlineLabel,
  formatMonthLabel,
} from "./format";

describe("日付表示の整形", () => {
  it("formatDateLong：2026-07-12 は日曜", () => {
    expect(formatDateLong("2026-07-12", "10:00")).toBe("7月12日（日）10:00");
    expect(formatDateLong("2026-07-19")).toBe("7月19日（日）");
  });

  it("formatDateShort：編集画面の行の値", () => {
    expect(formatDateShort("2026-07-12", "10:00")).toBe("7/12（日）10:00");
    expect(formatDateShort("2026-08-02")).toBe("8/2（日）");
  });

  it("formatDeadlineLabel：期限チップ", () => {
    expect(formatDeadlineLabel("2026-07-21")).toBe("7/21 まで");
  });

  it("formatClosedLabel：おしまい一覧の行", () => {
    expect(formatClosedLabel("2026-07-12")).toBe("7月12日に おしまい");
  });

  it("formatMonthLabel：月見出し", () => {
    expect(formatMonthLabel("2026-07-12")).toBe("2026年 7月");
  });

  it("formatCreatedByLabel：作成者行", () => {
    expect(formatCreatedByLabel("ゆい", "2026-06-30")).toBe(
      "ゆい が 6月30日に作成しました",
    );
  });
});
