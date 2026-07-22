import { describe, expect, it } from "@jest/globals";

import {
  buildCreationPushMessage,
  collectPushErrors,
  pickPartner,
  resolveCreatorLabel,
} from "./creationPush";

describe("pickPartner", () => {
  it("作成者以外のメンバーを返す", () => {
    const members = [
      { id: "a", displayName: "たろう", partnerNickname: null },
      { id: "b", displayName: "はなこ", partnerNickname: "たろちゃん" },
    ];
    expect(pickPartner(members, "a")).toEqual({
      id: "b",
      displayName: "はなこ",
      partnerNickname: "たろちゃん",
    });
  });

  it("ペアが未成立（1人だけ）なら null", () => {
    const members = [{ id: "a", displayName: "たろう", partnerNickname: null }];
    expect(pickPartner(members, "a")).toBeNull();
  });
});

describe("resolveCreatorLabel", () => {
  it("受信者のよびかたを優先する", () => {
    expect(
      resolveCreatorLabel({
        recipientNickname: "たろちゃん",
        creatorDisplayName: "たろう",
      }),
    ).toBe("たろちゃん");
  });

  it("よびかたが未設定なら作成者の表示名", () => {
    expect(
      resolveCreatorLabel({
        recipientNickname: null,
        creatorDisplayName: "たろう",
      }),
    ).toBe("たろう");
  });

  it("よびかたが空白のみでも作成者の表示名にもどる", () => {
    expect(
      resolveCreatorLabel({
        recipientNickname: "  ",
        creatorDisplayName: "たろう",
      }),
    ).toBe("たろう");
  });

  it("どちらも取れなければ「相手」へフォールバックする", () => {
    expect(
      resolveCreatorLabel({
        recipientNickname: null,
        creatorDisplayName: null,
      }),
    ).toBe("相手");
    expect(
      resolveCreatorLabel({ recipientNickname: "", creatorDisplayName: "  " }),
    ).toBe("相手");
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
