import { describe, expect, it } from "@jest/globals";

import { deriveClosedDate, derivePlanStatus } from "./status";
import type { Plan } from "./types";

function makePlan(overrides: Partial<Plan>): Plan {
  return {
    id: "p1",
    title: "テスト",
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
    createdAt: "2026-06-01",
    ...overrides,
  };
}

describe("derivePlanStatus", () => {
  const now = new Date(2026, 6, 12, 9, 0); // 2026-07-12 09:00

  it("日付なし・未おしまいは wish", () => {
    expect(derivePlanStatus(makePlan({}), now)).toBe("wish");
  });

  it("日付あり・未来なら scheduled", () => {
    expect(derivePlanStatus(makePlan({ date: "2026-07-19" }), now)).toBe(
      "scheduled",
    );
  });

  it("closed_at があれば常に done（日付が未来でも手動おしまい）", () => {
    expect(
      derivePlanStatus(
        makePlan({ date: "2026-07-19", closedAt: "2026-07-10" }),
        now,
      ),
    ).toBe("done");
  });

  it("時刻ありは、その時刻を過ぎたら done", () => {
    const plan = makePlan({ date: "2026-07-12", time: "10:00" });
    expect(derivePlanStatus(plan, new Date(2026, 6, 12, 9, 59))).toBe(
      "scheduled",
    );
    expect(derivePlanStatus(plan, new Date(2026, 6, 12, 10, 1))).toBe("done");
  });

  it("時刻なしは、その日の終わりまで scheduled のまま", () => {
    const plan = makePlan({ date: "2026-07-12" });
    expect(derivePlanStatus(plan, new Date(2026, 6, 12, 23, 59))).toBe(
      "scheduled",
    );
    expect(derivePlanStatus(plan, new Date(2026, 6, 13, 0, 0))).toBe("done");
  });

  it("期限（deadline）はステータスに影響しない", () => {
    expect(derivePlanStatus(makePlan({ deadline: "2026-07-01" }), now)).toBe(
      "wish",
    );
  });
});

describe("deriveClosedDate", () => {
  it("closed_at を優先する（手動おしまい）", () => {
    expect(
      deriveClosedDate(
        makePlan({ date: "2026-07-19", closedAt: "2026-07-10" }),
      ),
    ).toBe("2026-07-10");
  });

  it("closed_at が無ければ予定日（自動おしまい）", () => {
    expect(deriveClosedDate(makePlan({ date: "2026-07-12" }))).toBe(
      "2026-07-12",
    );
  });

  it("どちらも無ければ null", () => {
    expect(deriveClosedDate(makePlan({}))).toBeNull();
  });
});
