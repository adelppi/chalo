import { describe, expect, it } from "@jest/globals";

import {
  needsOnboarding,
  parseOnboardingProgress,
  serializeOnboardingProgress,
} from "./progress";

describe("parseOnboardingProgress", () => {
  it("null なら未着手として返す", () => {
    expect(parseOnboardingProgress(null)).toEqual({
      nameConfirmed: false,
      complete: false,
    });
  });

  it("壊れたJSONなら未着手として返す", () => {
    expect(parseOnboardingProgress("{invalid")).toEqual({
      nameConfirmed: false,
      complete: false,
    });
  });

  it("配列やnullのJSONなら未着手として返す", () => {
    expect(parseOnboardingProgress("[1,2,3]")).toEqual({
      nameConfirmed: false,
      complete: false,
    });
    expect(parseOnboardingProgress("null")).toEqual({
      nameConfirmed: false,
      complete: false,
    });
  });

  it("保存済みの値を復元する", () => {
    expect(
      parseOnboardingProgress('{"nameConfirmed":true,"complete":false}'),
    ).toEqual({ nameConfirmed: true, complete: false });
    expect(
      parseOnboardingProgress('{"nameConfirmed":true,"complete":true}'),
    ).toEqual({ nameConfirmed: true, complete: true });
  });

  it("不足しているフィールドは false 扱い", () => {
    expect(parseOnboardingProgress('{"nameConfirmed":true}')).toEqual({
      nameConfirmed: true,
      complete: false,
    });
  });
});

describe("serializeOnboardingProgress / parseOnboardingProgress の往復", () => {
  it("シリアライズ結果を再度パースすると同じ値になる", () => {
    const progress = { nameConfirmed: true, complete: false };
    expect(
      parseOnboardingProgress(serializeOnboardingProgress(progress)),
    ).toEqual(progress);
  });
});

describe("needsOnboarding", () => {
  it("未完了・未ペアなら必要", () => {
    expect(
      needsOnboarding({ nameConfirmed: false, complete: false }, false),
    ).toBe(true);
  });

  it("ローカルで完了済みなら不要", () => {
    expect(
      needsOnboarding({ nameConfirmed: true, complete: true }, false),
    ).toBe(false);
  });

  it("ローカル進捗が失われていてもペア済みなら不要（安全ネット）", () => {
    expect(
      needsOnboarding({ nameConfirmed: false, complete: false }, true),
    ).toBe(false);
  });
});
