import { describe, expect, it } from "@jest/globals";

import { buildPlansExportText } from "./exportText";
import type { Plan } from "./types";

// 2026-07-16 12:00 を「いま」とする（自動おしまい判定に影響）。
const NOW = new Date(2026, 6, 16, 12, 0);

function plan(overrides: Partial<Plan>): Plan {
  return {
    id: "plan-1",
    title: "水族館に行く",
    date: null,
    time: null,
    deadline: null,
    placeName: null,
    referenceUrl: null,
    memo: null,
    closedAt: null,
    lockedBy: null,
    lockedAt: null,
    lockedByName: null,
    ownerName: "ゆい",
    createdAt: "2026-07-01",
    ...overrides,
  };
}

describe("buildPlansExportText", () => {
  it("全項目ありのプランを domain/pairing.md の項目どおり整形する", () => {
    const text = buildPlansExportText(
      [
        plan({
          title: "水族館に行く",
          date: "2026-07-20",
          time: "10:00",
          deadline: "2026-07-19",
          placeName: "〇〇水族館",
          referenceUrl: "https://example.com/aquarium",
          memo: "年パスを検討",
        }),
      ],
      NOW,
    );

    expect(text).toContain("chalo プランの書き出し");
    expect(text).toContain("書き出し日: 2026年7月16日（木）");
    expect(text).toContain("プラン 1件・おしまい 0件");
    expect(text).toContain("・水族館に行く");
    expect(text).toContain("  ステータス: 予定");
    expect(text).toContain("  日付・時刻: 2026年7月20日（月）10:00");
    expect(text).toContain("  期限: 2026年7月19日（日）");
    expect(text).toContain("  場所: 〇〇水族館");
    expect(text).toContain("  参考URL: https://example.com/aquarium");
    expect(text).toContain("  メモ: 年パスを検討");
    expect(text).toContain("  作成者: ゆい");
    expect(text).toContain("  作成日: 2026年7月1日（水）");
  });

  it("値が無い項目の行は出さない（タイトル・ステータス・作成者・作成日は常に出す）", () => {
    const text = buildPlansExportText([plan({ title: "温泉旅行" })], NOW);

    expect(text).toContain("・温泉旅行");
    expect(text).toContain("  ステータス: いつか");
    expect(text).not.toContain("日付・時刻:");
    expect(text).not.toContain("期限:");
    expect(text).not.toContain("場所:");
    expect(text).not.toContain("参考URL:");
    expect(text).not.toContain("メモ:");
    expect(text).not.toContain("おしまい日:");
  });

  it("おしまいのプランは「おしまい」セクションに、おしまい日の新しい順で並ぶ", () => {
    const text = buildPlansExportText(
      [
        plan({ id: "a", title: "花火大会", closedAt: "2026-07-05" }),
        plan({ id: "b", title: "夏祭り", closedAt: "2026-07-10" }),
        plan({ id: "c", title: "温泉旅行" }),
      ],
      NOW,
    );

    expect(text).toContain("プラン 1件・おしまい 2件");
    expect(text).toContain("プラン（1件）");
    expect(text).toContain("おしまい（2件）");
    expect(text).toContain("  おしまい日: 2026年7月10日（金）");
    // 新しい順: 夏祭り（7/10）→ 花火大会（7/5）
    expect(text.indexOf("・夏祭り")).toBeLessThan(text.indexOf("・花火大会"));
    // 未おしまいはプランセクションが先
    expect(text.indexOf("・温泉旅行")).toBeLessThan(text.indexOf("・夏祭り"));
  });

  it("日付を過ぎたプランは自動おしまいとして扱い、おしまい日は予定日になる", () => {
    const text = buildPlansExportText(
      [plan({ title: "朝市に行く", date: "2026-07-10", time: "08:00" })],
      NOW,
    );

    expect(text).toContain("おしまい（1件）");
    expect(text).toContain("  ステータス: おしまい");
    expect(text).toContain("  おしまい日: 2026年7月10日（金）");
  });

  it("複数行メモは2行目以降を字下げして揃える", () => {
    const text = buildPlansExportText([plan({ memo: "1行目\n2行目" })], NOW);
    expect(text).toContain("  メモ: 1行目\n        2行目");
  });

  it("プランが1件も無ければその旨を書く", () => {
    const text = buildPlansExportText([], NOW);
    expect(text).toContain("プラン 0件・おしまい 0件");
    expect(text).toContain("プランはまだありません。");
  });
});
