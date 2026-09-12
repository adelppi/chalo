import { describe, expect, it } from "@jest/globals";

import { deriveAlbumDate, derivePlanAlbumRange } from "./album";
import type { Plan } from "./types";

function makePlan(overrides: Partial<Plan>): Plan {
  return {
    id: "p1",
    title: "チームラボ",
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
    createdAt: "2026-06-30",
    ...overrides,
  };
}

describe("deriveAlbumDate", () => {
  it("予定日があれば予定日", () => {
    expect(deriveAlbumDate(makePlan({ date: "2026-07-12" }))).toBe(
      "2026-07-12",
    );
  });

  it("日付なしプランはおしまい日", () => {
    expect(deriveAlbumDate(makePlan({ closedAt: "2026-07-20" }))).toBe(
      "2026-07-20",
    );
  });

  it("予定日より前に手動でおしまいにしても、予定日を優先する", () => {
    const plan = makePlan({ date: "2026-07-12", closedAt: "2026-07-05" });
    expect(deriveAlbumDate(plan)).toBe("2026-07-12");
  });

  it("日付もおしまい日も無ければ null", () => {
    expect(deriveAlbumDate(makePlan({}))).toBeNull();
  });
});

describe("derivePlanAlbumRange", () => {
  it("対象日の 00:00:00.000 〜 23:59:59.999 を端末ローカルで返す", () => {
    const range = derivePlanAlbumRange(makePlan({ date: "2026-07-12" }));
    expect(range).not.toBeNull();
    expect(range?.from).toEqual(new Date(2026, 6, 12, 0, 0, 0, 0));
    expect(range?.to).toEqual(new Date(2026, 6, 12, 23, 59, 59, 999));
  });

  it("時刻は区間に影響しない（抽出は日付単位）", () => {
    const withTime = derivePlanAlbumRange(
      makePlan({ date: "2026-07-12", time: "10:00" }),
    );
    const withoutTime = derivePlanAlbumRange(makePlan({ date: "2026-07-12" }));
    expect(withTime).toEqual(withoutTime);
  });

  it("対象日が無ければ null", () => {
    expect(derivePlanAlbumRange(makePlan({}))).toBeNull();
  });
});
