import { describe, expect, it } from "@jest/globals";

import {
  buildDeadlineNotificationContent,
  computeDeadlineNotificationFireDate,
  deadlineNotificationFieldsChanged,
  extractNotificationUrl,
  shouldScheduleDeadlineNotification,
} from "./deadline";

describe("computeDeadlineNotificationFireDate", () => {
  it("期限の2週間前の朝9:00（端末TZ）を返す", () => {
    expect(computeDeadlineNotificationFireDate("2026-07-28")).toEqual(
      new Date(2026, 6, 14, 9, 0, 0),
    );
  });

  it("月をまたぐ繰り下がりを解決する", () => {
    expect(computeDeadlineNotificationFireDate("2026-07-10")).toEqual(
      new Date(2026, 5, 26, 9, 0, 0),
    );
  });

  it("年をまたぐ繰り下がりを解決する", () => {
    expect(computeDeadlineNotificationFireDate("2026-01-05")).toEqual(
      new Date(2025, 11, 22, 9, 0, 0),
    );
  });
});

describe("shouldScheduleDeadlineNotification", () => {
  const now = new Date(2026, 6, 14, 12, 0, 0); // 2026-07-14 12:00

  it("期限があり、日付なし、2週間以上先なら予約する", () => {
    expect(
      shouldScheduleDeadlineNotification(
        { date: null, deadline: "2026-07-29" },
        now,
      ),
    ).toBe(true);
  });

  it("期限が入っていなければ予約しない", () => {
    expect(
      shouldScheduleDeadlineNotification({ date: null, deadline: null }, now),
    ).toBe(false);
  });

  it("日付（行く予定日）が入っていれば予約しない", () => {
    expect(
      shouldScheduleDeadlineNotification(
        { date: "2026-08-01", deadline: "2026-07-29" },
        now,
      ),
    ).toBe(false);
  });

  it("期限まで2週間を切っていれば（発火日時が過去なら）予約しない", () => {
    // 2週間前の朝9:00 = 2026-07-14 09:00 は now より前
    expect(
      shouldScheduleDeadlineNotification(
        { date: null, deadline: "2026-07-28" },
        now,
      ),
    ).toBe(false);
  });

  it("発火日時ちょうどは予約しない（境界）", () => {
    expect(
      shouldScheduleDeadlineNotification(
        { date: null, deadline: "2026-07-28" },
        new Date(2026, 6, 14, 9, 0, 0),
      ),
    ).toBe(false);
  });
});

describe("buildDeadlineNotificationContent", () => {
  it("タイトル・期限日入りの文面とプラン詳細への URL を組み立てる", () => {
    expect(
      buildDeadlineNotificationContent({
        id: "plan-1",
        title: "海を見にいく",
        deadline: "2026-07-28",
      }),
    ).toEqual({
      title: "「海を見にいく」の期限が近づいています",
      body: "期限は7月28日です。そろそろ予定を決めませんか？",
      url: "/plan/plan-1",
    });
  });

  it("期限なしは組み立てられない", () => {
    expect(
      buildDeadlineNotificationContent({
        id: "plan-1",
        title: "海を見にいく",
        deadline: null,
      }),
    ).toBeNull();
  });
});

describe("deadlineNotificationFieldsChanged", () => {
  const base = { title: "海を見にいく", date: null, deadline: "2026-07-28" };

  it("タイトル・日付・期限のどれかが変われば true", () => {
    expect(
      deadlineNotificationFieldsChanged(base, { ...base, title: "山にいく" }),
    ).toBe(true);
    expect(
      deadlineNotificationFieldsChanged(base, { ...base, date: "2026-07-20" }),
    ).toBe(true);
    expect(
      deadlineNotificationFieldsChanged(base, {
        ...base,
        deadline: "2026-08-01",
      }),
    ).toBe(true);
    expect(
      deadlineNotificationFieldsChanged(base, { ...base, deadline: null }),
    ).toBe(true);
  });

  it("影響する項目が変わっていなければ false", () => {
    expect(deadlineNotificationFieldsChanged(base, { ...base })).toBe(false);
  });
});

describe("extractNotificationUrl", () => {
  it("data.url が文字列ならそれを返す", () => {
    expect(extractNotificationUrl({ url: "/plan/plan-1" })).toBe(
      "/plan/plan-1",
    );
  });

  it("data が無い・url が不正なら null", () => {
    expect(extractNotificationUrl(undefined)).toBeNull();
    expect(extractNotificationUrl(null)).toBeNull();
    expect(extractNotificationUrl({})).toBeNull();
    expect(extractNotificationUrl({ url: 123 })).toBeNull();
    expect(extractNotificationUrl({ url: "" })).toBeNull();
  });
});
