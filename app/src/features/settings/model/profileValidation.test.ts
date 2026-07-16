import { describe, expect, it } from "@jest/globals";

import {
  PROFILE_NAME_MAX_LENGTH,
  profileNameErrorMessage,
  validateProfileName,
} from "./profileValidation";

describe("validateProfileName", () => {
  it("空欄は無効", () => {
    expect(validateProfileName("")).toEqual({
      valid: false,
      reason: "empty",
    });
  });

  it("空白のみは無効", () => {
    expect(validateProfileName("   ")).toEqual({
      valid: false,
      reason: "empty",
    });
  });

  it("前後の空白を除去して有効値を返す", () => {
    expect(validateProfileName("  ゆい  ")).toEqual({
      valid: true,
      value: "ゆい",
    });
  });

  it(`${PROFILE_NAME_MAX_LENGTH}文字ちょうどは有効`, () => {
    const name = "あ".repeat(PROFILE_NAME_MAX_LENGTH);
    expect(validateProfileName(name)).toEqual({ valid: true, value: name });
  });

  it(`${PROFILE_NAME_MAX_LENGTH}文字を超えると無効`, () => {
    const name = "あ".repeat(PROFILE_NAME_MAX_LENGTH + 1);
    expect(validateProfileName(name)).toEqual({
      valid: false,
      reason: "too-long",
    });
  });
});

describe("profileNameErrorMessage", () => {
  it("理由ごとに文言を出し分ける", () => {
    expect(profileNameErrorMessage("empty")).toBe("名前を入力してください。");
    expect(profileNameErrorMessage("too-long")).toBe(
      `${PROFILE_NAME_MAX_LENGTH}文字以内で入力してください。`,
    );
  });
});
