import { describe, expect, it } from "@jest/globals";

import { CLOSED_GREETINGS, pickClosedGreeting } from "./greeting";

describe("pickClosedGreeting", () => {
  it("下限(0)は最初の挨拶", () => {
    expect(pickClosedGreeting(0)).toBe("おつかれさま！");
  });

  it("前半は最初の挨拶", () => {
    expect(pickClosedGreeting(0.4999)).toBe("おつかれさま！");
  });

  it("中央値で2番目の挨拶に切り替わる", () => {
    expect(pickClosedGreeting(0.5)).toBe("おかえり！");
  });

  it("上限に近い値でも配列の外を指さない", () => {
    expect(pickClosedGreeting(0.999999)).toBe("おかえり！");
  });

  it("範囲外の値もクランプする", () => {
    expect(pickClosedGreeting(-1)).toBe("おつかれさま！");
    expect(pickClosedGreeting(1)).toBe("おかえり！");
  });

  it("常に既定の挨拶のいずれかを返す", () => {
    for (let i = 0; i < 100; i += 1) {
      expect(CLOSED_GREETINGS).toContain(pickClosedGreeting(Math.random()));
    }
  });
});
