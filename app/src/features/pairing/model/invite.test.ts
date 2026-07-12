import { describe, expect, it } from "@jest/globals";

import {
  formatRemainingLabel,
  isValidCodeFormat,
  redeemErrorMessage,
} from "./invite";

describe("isValidCodeFormat", () => {
  it("6桁の数字だけを受け付ける", () => {
    expect(isValidCodeFormat("483902")).toBe(true);
    expect(isValidCodeFormat("48390")).toBe(false);
    expect(isValidCodeFormat("4839021")).toBe(false);
    expect(isValidCodeFormat("48390a")).toBe(false);
    expect(isValidCodeFormat("")).toBe(false);
  });
});

describe("formatRemainingLabel", () => {
  const now = new Date("2026-07-12T10:00:00");

  it("残り時間を切り上げて表示する", () => {
    expect(formatRemainingLabel("2026-07-13T09:00:00", now)).toBe(
      "あと 23時間 つかえます",
    );
    expect(formatRemainingLabel("2026-07-12T10:30:00", now)).toBe(
      "あと 1時間 つかえます",
    );
  });

  it("期限切れは null", () => {
    expect(formatRemainingLabel("2026-07-12T09:59:00", now)).toBeNull();
  });
});

describe("redeemErrorMessage", () => {
  it("F-3 の文言を返す", () => {
    expect(redeemErrorMessage("not-found")).toBe(
      "コードが見つかりません。もういちど確かめてください。",
    );
    expect(redeemErrorMessage("expired")).toBe(
      "このコードは期限が切れています。新しいコードをもらってください。",
    );
    expect(redeemErrorMessage("own-code")).toBe(
      "自分でつくったコードは使えません。相手の画面で入力してもらいましょう。",
    );
    expect(redeemErrorMessage("already-paired")).toBe(
      "すでにペアになっています。設定からペアを確認できます。",
    );
  });
});
