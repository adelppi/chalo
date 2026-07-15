import { describe, expect, it } from "@jest/globals";

import {
  buildCreationPushMessage,
  collectPushErrors,
  pickPartner,
} from "./creationPush";

describe("pickPartner", () => {
  it("作成者以外のメンバーを返す", () => {
    const members = [
      { id: "a", displayName: "たろう" },
      { id: "b", displayName: "はなこ" },
    ];
    expect(pickPartner(members, "a")).toEqual({ id: "b", displayName: "はなこ" });
  });

  it("ペアが未成立（1人だけ）なら null", () => {
    const members = [{ id: "a", displayName: "たろう" }];
    expect(pickPartner(members, "a")).toBeNull();
  });
});

describe("buildCreationPushMessage", () => {
  it("トークンがあればメッセージを組み立てる", () => {
    const message = buildCreationPushMessage({
      tokens: ["ExponentPushToken[a]", "ExponentPushToken[b]"],
      creatorName: "たろう",
      planTitle: "水族館に行く",
      planId: "plan-1",
    });
    expect(message).toEqual({
      to: ["ExponentPushToken[a]", "ExponentPushToken[b]"],
      title: "たろうがプランを追加しました🐾",
      body: "水族館に行く",
      data: { url: "/plan/plan-1" },
      sound: "default",
    });
  });

  it("トークンが無ければ null（送るものが無い）", () => {
    const message = buildCreationPushMessage({
      tokens: [],
      creatorName: "たろう",
      planTitle: "水族館に行く",
      planId: "plan-1",
    });
    expect(message).toBeNull();
  });
});

describe("collectPushErrors", () => {
  it("エラーのチケットだけを抽出する", () => {
    const errors = collectPushErrors([
      { status: "ok" },
      { status: "error", message: "DeviceNotRegistered" },
      { status: "ok" },
    ]);
    expect(errors).toEqual(["DeviceNotRegistered"]);
  });

  it("エラーが無ければ空配列", () => {
    expect(collectPushErrors([{ status: "ok" }])).toEqual([]);
  });
});
