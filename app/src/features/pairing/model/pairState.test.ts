import { describe, expect, it } from "@jest/globals";

import { derivePairState } from "./pairState";

describe("derivePairState", () => {
  it("pair_id が無ければ solo（招待コードを引き継ぐ）", () => {
    const inviteCode = { code: "123456", expiresAt: "2026-07-17T00:00:00Z" };
    expect(
      derivePairState({
        myName: "ゆい",
        pairId: null,
        partnerDisplayName: null,
        partnerNickname: null,
        inviteCode,
      }),
    ).toEqual({ status: "solo", inviteCode });
  });

  it("pair_id が無く招待コードも無ければ solo（inviteCode: null）", () => {
    expect(
      derivePairState({
        myName: "ゆい",
        pairId: null,
        partnerDisplayName: null,
        partnerNickname: null,
        inviteCode: null,
      }),
    ).toEqual({ status: "solo", inviteCode: null });
  });

  it("pair_id と相手の行があれば paired", () => {
    expect(
      derivePairState({
        myName: "ゆい",
        pairId: "pair-1",
        partnerDisplayName: "たろう",
        partnerNickname: null,
        inviteCode: null,
      }),
    ).toEqual({
      status: "paired",
      myName: "ゆい",
      partnerName: "たろう",
      partnerDisplayName: "たろう",
    });
  });

  it("よびかたがあれば partnerName に反映し、原名は partnerDisplayName に残す", () => {
    expect(
      derivePairState({
        myName: "ゆい",
        pairId: "pair-1",
        partnerDisplayName: "たろう",
        partnerNickname: "たろちゃん",
        inviteCode: null,
      }),
    ).toEqual({
      status: "paired",
      myName: "ゆい",
      partnerName: "たろちゃん",
      partnerDisplayName: "たろう",
    });
  });

  it("よびかたが空白のみなら表示名にもどる", () => {
    expect(
      derivePairState({
        myName: "ゆい",
        pairId: "pair-1",
        partnerDisplayName: "たろう",
        partnerNickname: "   ",
        inviteCode: null,
      }),
    ).toMatchObject({ partnerName: "たろう" });
  });

  it("pair_id はあるのに相手の行が無ければ partner-left（パートナー削除済み）", () => {
    expect(
      derivePairState({
        myName: "ゆい",
        pairId: "pair-1",
        partnerDisplayName: null,
        partnerNickname: "たろちゃん",
        inviteCode: null,
      }),
    ).toEqual({ status: "partner-left" });
  });

  it("相手の表示名が空文字でも行があれば paired（削除済みと混同しない）", () => {
    expect(
      derivePairState({
        myName: "ゆい",
        pairId: "pair-1",
        partnerDisplayName: "",
        partnerNickname: null,
        inviteCode: null,
      }),
    ).toEqual({
      status: "paired",
      myName: "ゆい",
      partnerName: "",
      partnerDisplayName: "",
    });
  });
});
