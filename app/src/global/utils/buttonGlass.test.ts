import { describe, expect, it } from "@jest/globals";

import { palette } from "@global/constants/palette";

import { resolveButtonGlass, type ButtonVariant } from "./buttonGlass";

const base = { disabled: false, enabled: true, available: true };

describe("resolveButtonGlass", () => {
  it.each<[ButtonVariant, string | undefined]>([
    ["primary", palette.ink],
    ["accent", palette.plum],
    ["outline", undefined],
    ["cream", palette.linen],
    ["destructive", palette.rust],
  ])("%s は役割の色のガラスにする", (variant, tintColor) => {
    expect(resolveButtonGlass({ ...base, variant })).toEqual({ tintColor });
  });

  it("文字だけのボタンはガラスにしない", () => {
    expect(resolveButtonGlass({ ...base, variant: "ghost" })).toBeNull();
  });

  it("非活性のボタンはガラスにしない", () => {
    expect(
      resolveButtonGlass({ ...base, variant: "primary", disabled: true }),
    ).toBeNull();
  });

  it("呼び出し側が望まないとき（ダイアログ・シート内）はガラスにしない", () => {
    expect(
      resolveButtonGlass({ ...base, variant: "primary", enabled: false }),
    ).toBeNull();
  });

  it("リキッドグラスが使えない環境ではガラスにしない", () => {
    expect(
      resolveButtonGlass({ ...base, variant: "primary", available: false }),
    ).toBeNull();
  });
});
