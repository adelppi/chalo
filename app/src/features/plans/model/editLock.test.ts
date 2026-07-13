import { describe, expect, it } from "@jest/globals";

import {
  canStartEditing,
  EDIT_LOCK_TTL_MS,
  evaluateEditLock,
} from "./editLock";

const ME = "user-a";
const PARTNER = "user-b";
const now = new Date("2026-07-14T12:00:00.000Z");

/** now から ms だけ前の ISO 文字列 */
function before(ms: number): string {
  return new Date(now.getTime() - ms).toISOString();
}

describe("evaluateEditLock", () => {
  it("locked_by が null なら free", () => {
    expect(
      evaluateEditLock({ lockedBy: null, lockedAt: null, userId: ME, now }),
    ).toBe("free");
  });

  it("locked_by があっても locked_at が null なら free", () => {
    expect(
      evaluateEditLock({
        lockedBy: PARTNER,
        lockedAt: null,
        userId: ME,
        now,
      }),
    ).toBe("free");
  });

  it("相手のロックが TTL 内なら partner", () => {
    expect(
      evaluateEditLock({
        lockedBy: PARTNER,
        lockedAt: before(60 * 1000),
        userId: ME,
        now,
      }),
    ).toBe("partner");
  });

  it("相手のロックでも TTL ちょうど経過で free（強制終了後も相手が編集できる）", () => {
    expect(
      evaluateEditLock({
        lockedBy: PARTNER,
        lockedAt: before(EDIT_LOCK_TTL_MS),
        userId: ME,
        now,
      }),
    ).toBe("free");
  });

  it("相手のロックが TTL 1ms 手前なら partner（境界）", () => {
    expect(
      evaluateEditLock({
        lockedBy: PARTNER,
        lockedAt: before(EDIT_LOCK_TTL_MS - 1),
        userId: ME,
        now,
      }),
    ).toBe("partner");
  });

  it("自分の残ロック（TTL 内）は mine", () => {
    expect(
      evaluateEditLock({
        lockedBy: ME,
        lockedAt: before(60 * 1000),
        userId: ME,
        now,
      }),
    ).toBe("mine");
  });

  it("自分の残ロックも TTL 切れなら free", () => {
    expect(
      evaluateEditLock({
        lockedBy: ME,
        lockedAt: before(EDIT_LOCK_TTL_MS + 1),
        userId: ME,
        now,
      }),
    ).toBe("free");
  });

  it("locked_at が未来（時計ズレ）でも TTL 内として扱う", () => {
    expect(
      evaluateEditLock({
        lockedBy: PARTNER,
        lockedAt: before(-30 * 1000),
        userId: ME,
        now,
      }),
    ).toBe("partner");
  });

  it("locked_at が不正な文字列なら free（永久ロックにしない）", () => {
    expect(
      evaluateEditLock({
        lockedBy: PARTNER,
        lockedAt: "こわれた値",
        userId: ME,
        now,
      }),
    ).toBe("free");
  });
});

describe("canStartEditing", () => {
  it("free と mine は編集を開始できる", () => {
    expect(canStartEditing("free")).toBe(true);
    expect(canStartEditing("mine")).toBe(true);
  });

  it("partner は編集を開始できない", () => {
    expect(canStartEditing("partner")).toBe(false);
  });
});
