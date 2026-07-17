import { describe, expect, it } from "@jest/globals";

import {
  buildLogEntry,
  buildScreenViewFields,
  sanitizeError,
  sanitizeIds,
} from "./sanitize";

const NOW = new Date("2026-07-17T10:00:00.000Z");
const PLAN_ID = "5f0c2c74-0000-4000-8000-000000000001";
const PAIR_ID = "5f0c2c74-0000-4000-8000-0000000000aa";

describe("sanitizeIds", () => {
  it("UUID の値だけを残す", () => {
    expect(
      sanitizeIds({
        planId: PLAN_ID,
        title: "チームラボプラネッツ",
        code: "ABC123",
      }),
    ).toEqual({ planId: PLAN_ID });
  });

  it("トークン形式でないキーは落とす", () => {
    expect(sanitizeIds({ プランID: PLAN_ID })).toBeUndefined();
  });

  it("残るものが無ければ undefined", () => {
    expect(sanitizeIds({})).toBeUndefined();
    expect(sanitizeIds(undefined)).toBeUndefined();
  });
});

describe("sanitizeError", () => {
  it("Error からは name とスタックだけを残し、message は捨てる", () => {
    const error = new Error("ユーザーが入力した内容が混ざったメッセージ");
    error.name = "TypeError";
    const info = sanitizeError(error);
    expect(info).toMatchObject({ name: "TypeError" });
    expect(info?.stack).toBeDefined();
    expect(JSON.stringify(info)).not.toContain("ユーザーが入力した内容");
  });

  it("code を持つエラー（PostgrestError 等）は code も残す", () => {
    const info = sanitizeError({
      name: "PostgrestError",
      code: "42501",
      message: "row level security violation",
    });
    expect(info).toEqual({ name: "PostgrestError", code: "42501" });
  });

  it("Error でない値は UnknownError に丸める", () => {
    expect(sanitizeError("文字列エラー")).toEqual({ name: "UnknownError" });
    expect(sanitizeError(42)).toEqual({ name: "UnknownError" });
  });

  it("null / undefined は undefined", () => {
    expect(sanitizeError(null)).toBeUndefined();
    expect(sanitizeError(undefined)).toBeUndefined();
  });
});

describe("buildLogEntry", () => {
  it("時刻・レベル・イベント名を構造化する", () => {
    expect(buildLogEntry(NOW, "info", "plan_create")).toEqual({
      ts: "2026-07-17T10:00:00.000Z",
      level: "info",
      event: "plan_create",
    });
  });

  it("許可フィールドが揃っていれば全部残る", () => {
    expect(
      buildLogEntry(NOW, "info", "screen_view", {
        screen: "(app)/plan/[id]",
        ids: { id: PLAN_ID, pairId: PAIR_ID },
        detail: "granted",
      }),
    ).toEqual({
      ts: "2026-07-17T10:00:00.000Z",
      level: "info",
      event: "screen_view",
      screen: "(app)/plan/[id]",
      ids: { id: PLAN_ID, pairId: PAIR_ID },
      detail: "granted",
    });
  });

  it("イベント名に自由文を渡すと invalid_event に置き換える", () => {
    const entry = buildLogEntry(NOW, "info", "プランを作成した！");
    expect(entry.event).toBe("invalid_event");
  });

  it("detail の自由文（ユーザー入力の混入）は落とす", () => {
    const entry = buildLogEntry(NOW, "info", "plan_create", {
      detail: "タイトル: 温泉に行く",
    });
    expect(entry.detail).toBeUndefined();
  });

  it("screen に許可外の文字が混ざっていたら落とす", () => {
    const entry = buildLogEntry(NOW, "info", "screen_view", {
      screen: "プラン詳細 温泉に行く",
    });
    expect(entry.screen).toBeUndefined();
  });
});

describe("buildScreenViewFields", () => {
  it("ルート名（セグメント結合）と UUID の params だけを残す", () => {
    expect(
      buildScreenViewFields(["(app)", "plan", "[id]"], {
        id: PLAN_ID,
        title: "温泉に行く",
      }),
    ).toEqual({
      screen: "(app)/plan/[id]",
      ids: { id: PLAN_ID },
    });
  });

  it("params に UUID が無ければ ids を付けない", () => {
    expect(buildScreenViewFields(["(app)", "(tabs)"], { q: "検索語" })).toEqual(
      { screen: "(app)/(tabs)" },
    );
  });

  it("ルート直下（セグメント無し）は (root) とする", () => {
    expect(buildScreenViewFields([], {})).toEqual({ screen: "(root)" });
  });
});
