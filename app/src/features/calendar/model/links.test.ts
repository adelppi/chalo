import { describe, expect, it } from "@jest/globals";

import {
  findCalendarLink,
  parseCalendarLinks,
  removeCalendarLink,
  serializeCalendarLinks,
  upsertCalendarLink,
} from "./links";

const link = { planId: "plan-1", eventId: "event-1", calendarId: "cal-1" };

describe("parseCalendarLinks", () => {
  it("null・空文字は空の対応表", () => {
    expect(parseCalendarLinks(null)).toEqual({});
    expect(parseCalendarLinks("")).toEqual({});
  });

  it("保存した文字列を往復できる", () => {
    const links = upsertCalendarLink({}, link);
    expect(parseCalendarLinks(serializeCalendarLinks(links))).toEqual(links);
  });

  it("壊れた JSON は空として扱う", () => {
    expect(parseCalendarLinks("{oops")).toEqual({});
  });

  it("マップ以外の JSON・形の合わない項目は捨てる", () => {
    expect(parseCalendarLinks("[1,2]")).toEqual({});
    expect(
      parseCalendarLinks(
        JSON.stringify({
          "plan-1": { eventId: "event-1", calendarId: "cal-1" },
          "plan-2": { eventId: 123 },
          "plan-3": "text",
        }),
      ),
    ).toEqual({ "plan-1": { eventId: "event-1", calendarId: "cal-1" } });
  });
});

describe("findCalendarLink", () => {
  it("あれば planId 込みのリンクを返す", () => {
    const links = upsertCalendarLink({}, link);
    expect(findCalendarLink(links, "plan-1")).toEqual(link);
  });

  it("無ければ null（＝未連携）", () => {
    expect(findCalendarLink({}, "plan-1")).toBeNull();
  });
});

describe("upsertCalendarLink / removeCalendarLink", () => {
  it("同じ planId は上書きする", () => {
    const links = upsertCalendarLink(upsertCalendarLink({}, link), {
      ...link,
      eventId: "event-2",
    });
    expect(findCalendarLink(links, "plan-1")?.eventId).toBe("event-2");
  });

  it("削除すると未連携に戻る（他のリンクは残る）", () => {
    const links = upsertCalendarLink(upsertCalendarLink({}, link), {
      planId: "plan-2",
      eventId: "event-2",
      calendarId: "cal-1",
    });
    const removed = removeCalendarLink(links, "plan-1");
    expect(findCalendarLink(removed, "plan-1")).toBeNull();
    expect(findCalendarLink(removed, "plan-2")).not.toBeNull();
  });

  it("元の対応表は変更しない（純粋関数）", () => {
    const links = upsertCalendarLink({}, link);
    removeCalendarLink(links, "plan-1");
    expect(findCalendarLink(links, "plan-1")).toEqual(link);
  });
});
