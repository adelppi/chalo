import { describe, expect, it } from "@jest/globals";

import {
  EMPTY_PLAN_DRAFT,
  normalizePlanDraft,
  planDraftChanged,
  planToDraft,
} from "./draft";
import type { Plan, PlanDraft } from "./types";

const plan: Plan = {
  id: "p1",
  title: "たこ焼きパーティー",
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
  ownerName: "テスト",
  createdAt: "2026-09-21",
};

const draft = (overrides: Partial<PlanDraft> = {}): PlanDraft => ({
  ...EMPTY_PLAN_DRAFT,
  title: "たこ焼きパーティー",
  ...overrides,
});

describe("normalizePlanDraft", () => {
  it("タイトルの前後の空白を落とす", () => {
    expect(normalizePlanDraft(draft({ title: "  たこ焼き  " })).title).toBe(
      "たこ焼き",
    );
  });

  it("日付が無ければ時刻を落とす", () => {
    const result = normalizePlanDraft(draft({ date: null, time: "18:00" }));
    expect(result.time).toBeNull();
  });

  it("日付があれば時刻を残し、期限を落とす（Issue #58）", () => {
    const result = normalizePlanDraft(
      draft({ date: "2026-10-01", time: "18:00", deadline: "2026-09-30" }),
    );
    expect(result.time).toBe("18:00");
    expect(result.deadline).toBeNull();
  });

  it("日付が無ければ期限は残る", () => {
    const result = normalizePlanDraft(draft({ deadline: "2026-09-30" }));
    expect(result.deadline).toBe("2026-09-30");
  });
});

describe("planToDraft", () => {
  it("プランの値をそのままフォームの初期値にする", () => {
    expect(planToDraft({ ...plan, memo: "ソースは多めがいい" })).toEqual({
      title: "たこ焼きパーティー",
      date: null,
      time: null,
      deadline: null,
      referenceUrl: null,
      memo: "ソースは多めがいい",
    });
  });

  it("日付が無いのに時刻を持つプランでも、初期値では時刻を落とす（開いた直後を未変更にする）", () => {
    expect(planToDraft({ ...plan, date: null, time: "18:00" }).time).toBeNull();
  });
});

describe("planDraftChanged", () => {
  it("同じ値なら変更なし", () => {
    expect(planDraftChanged(draft(), draft())).toBe(false);
  });

  it("空白を足しただけなら変更なし（整形後で比べる）", () => {
    expect(
      planDraftChanged(
        planToDraft(plan),
        normalizePlanDraft(draft({ title: "たこ焼きパーティー  " })),
      ),
    ).toBe(false);
  });

  it("項目ごとの変更を拾う", () => {
    expect(planDraftChanged(draft(), draft({ title: "お好み焼き" }))).toBe(
      true,
    );
    expect(planDraftChanged(draft(), draft({ date: "2026-10-01" }))).toBe(true);
    expect(
      planDraftChanged(
        draft({ date: "2026-10-01" }),
        draft({ date: "2026-10-01", time: "18:00" }),
      ),
    ).toBe(true);
    expect(planDraftChanged(draft(), draft({ deadline: "2026-09-30" }))).toBe(
      true,
    );
    expect(
      planDraftChanged(draft(), draft({ referenceUrl: "https://example.com" })),
    ).toBe(true);
    expect(planDraftChanged(draft(), draft({ memo: "ソース多め" }))).toBe(true);
  });

  it("作成フォームは、何も入れていなければ変更なし", () => {
    expect(
      planDraftChanged(
        EMPTY_PLAN_DRAFT,
        normalizePlanDraft({ ...EMPTY_PLAN_DRAFT, title: "   " }),
      ),
    ).toBe(false);
  });
});
