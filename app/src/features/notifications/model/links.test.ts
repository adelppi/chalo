import { describe, expect, it } from "@jest/globals";

import {
  findDeadlineNotificationLink,
  parseDeadlineNotificationLinks,
  removeDeadlineNotificationLink,
  serializeDeadlineNotificationLinks,
  upsertDeadlineNotificationLink,
} from "./links";

const link = { planId: "plan-1", notificationId: "notif-1" };

describe("parseDeadlineNotificationLinks", () => {
  it("null・空文字は空の対応表", () => {
    expect(parseDeadlineNotificationLinks(null)).toEqual({});
    expect(parseDeadlineNotificationLinks("")).toEqual({});
  });

  it("保存した文字列を往復できる", () => {
    const links = upsertDeadlineNotificationLink({}, link);
    expect(
      parseDeadlineNotificationLinks(serializeDeadlineNotificationLinks(links)),
    ).toEqual(links);
  });

  it("壊れた JSON は空として扱う", () => {
    expect(parseDeadlineNotificationLinks("{oops")).toEqual({});
  });

  it("マップ以外の JSON・形の合わない項目は捨てる", () => {
    expect(parseDeadlineNotificationLinks("[1,2]")).toEqual({});
    expect(
      parseDeadlineNotificationLinks(
        JSON.stringify({
          "plan-1": { notificationId: "notif-1" },
          "plan-2": { notificationId: 123 },
          "plan-3": "text",
        }),
      ),
    ).toEqual({ "plan-1": { notificationId: "notif-1" } });
  });
});

describe("findDeadlineNotificationLink", () => {
  it("あれば planId 込みのリンクを返す", () => {
    const links = upsertDeadlineNotificationLink({}, link);
    expect(findDeadlineNotificationLink(links, "plan-1")).toEqual(link);
  });

  it("無ければ null（＝未予約）", () => {
    expect(findDeadlineNotificationLink({}, "plan-1")).toBeNull();
  });
});

describe("upsertDeadlineNotificationLink / removeDeadlineNotificationLink", () => {
  it("同じ planId は上書きする", () => {
    const links = upsertDeadlineNotificationLink(
      upsertDeadlineNotificationLink({}, link),
      { ...link, notificationId: "notif-2" },
    );
    expect(findDeadlineNotificationLink(links, "plan-1")?.notificationId).toBe(
      "notif-2",
    );
  });

  it("削除すると未予約に戻る（他のリンクは残る）", () => {
    const links = upsertDeadlineNotificationLink(
      upsertDeadlineNotificationLink({}, link),
      { planId: "plan-2", notificationId: "notif-2" },
    );
    const removed = removeDeadlineNotificationLink(links, "plan-1");
    expect(findDeadlineNotificationLink(removed, "plan-1")).toBeNull();
    expect(findDeadlineNotificationLink(removed, "plan-2")).not.toBeNull();
  });

  it("元の対応表は変更しない（純粋関数）", () => {
    const links = upsertDeadlineNotificationLink({}, link);
    removeDeadlineNotificationLink(links, "plan-1");
    expect(findDeadlineNotificationLink(links, "plan-1")).toEqual(link);
  });
});
