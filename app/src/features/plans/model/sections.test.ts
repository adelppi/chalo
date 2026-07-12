import { describe, expect, it } from "@jest/globals";

import {
  buildHomeSections,
  countPlanStatuses,
  groupDoneByMonth,
} from "./sections";
import type { Plan } from "./types";

function makePlan(id: string, overrides: Partial<Plan>): Plan {
  return {
    id,
    title: id,
    date: null,
    time: null,
    deadline: null,
    placeName: null,
    referenceUrl: null,
    memo: null,
    closedAt: null,
    lockedByName: null,
    ownerName: "ゆい",
    createdAt: "2026-06-01",
    ...overrides,
  };
}

const now = new Date(2026, 6, 10, 12, 0); // 2026-07-10

describe("buildHomeSections", () => {
  it("いちばん近い予定が next、残りが日付順で upcoming になる", () => {
    const plans = [
      makePlan("hanabi", { date: "2026-08-02", time: "19:00" }),
      makePlan("teamlab", { date: "2026-07-12", time: "10:00" }),
      makePlan("furugi", { date: "2026-07-19" }),
    ];
    const sections = buildHomeSections(plans, now);
    expect(sections.next?.id).toBe("teamlab");
    expect(sections.upcoming.map((p) => p.id)).toEqual(["furugi", "hanabi"]);
  });

  it("同日の中では時刻なしが先、時刻ありが後になる", () => {
    const plans = [
      makePlan("late", { date: "2026-07-12", time: "10:00" }),
      makePlan("allday", { date: "2026-07-12" }),
    ];
    const sections = buildHomeSections(plans, now);
    expect(sections.next?.id).toBe("allday");
  });

  it("日付なしは wishes に作成順で入る", () => {
    const plans = [
      makePlan("cat", { createdAt: "2026-07-05" }),
      makePlan("monet", { createdAt: "2026-06-20", deadline: "2026-07-21" }),
    ];
    const sections = buildHomeSections(plans, now);
    expect(sections.next).toBeNull();
    expect(sections.wishes.map((p) => p.id)).toEqual(["monet", "cat"]);
  });

  it("おしまい済み（過去の予定日・手動おしまい）は含めない", () => {
    const plans = [
      makePlan("past", { date: "2026-07-01" }),
      makePlan("closed", { closedAt: "2026-07-02" }),
    ];
    const sections = buildHomeSections(plans, now);
    expect(sections.next).toBeNull();
    expect(sections.upcoming).toEqual([]);
    expect(sections.wishes).toEqual([]);
  });
});

describe("groupDoneByMonth", () => {
  it("おしまい日の新しい順に月ごとへグループ化する", () => {
    const plans = [
      makePlan("hotaru", { closedAt: "2026-06-14" }),
      makePlan("teamlab", { date: "2026-07-01" }), // 自動おしまい（予定日=おしまい日）
      makePlan("picnic", { closedAt: "2026-06-21" }),
      makePlan("future", { date: "2026-07-19" }), // まだ予定
    ];
    const groups = groupDoneByMonth(plans, now);
    expect(groups.map((g) => g.label)).toEqual(["2026年 7月", "2026年 6月"]);
    expect(groups[0].plans.map((p) => p.id)).toEqual(["teamlab"]);
    expect(groups[1].plans.map((p) => p.id)).toEqual(["picnic", "hotaru"]);
  });
});

describe("countPlanStatuses", () => {
  it("アクティブとおしまいを数える", () => {
    const plans = [
      makePlan("wish", {}),
      makePlan("scheduled", { date: "2026-07-19" }),
      makePlan("done", { closedAt: "2026-07-01" }),
    ];
    expect(countPlanStatuses(plans, now)).toEqual({ active: 2, done: 1 });
  });
});
