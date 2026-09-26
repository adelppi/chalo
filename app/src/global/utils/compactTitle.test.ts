import { describe, expect, it } from "@jest/globals";

import { isHeadingScrolledPast } from "./compactTitle";

describe("isHeadingScrolledPast", () => {
  it("見出しの位置が未計測なら隠れていない扱い", () => {
    expect(isHeadingScrolledPast(500, null)).toBe(false);
  });

  it("見出しの下端に届くまでは隠れていない", () => {
    expect(isHeadingScrolledPast(0, 64)).toBe(false);
    expect(isHeadingScrolledPast(63.5, 64)).toBe(false);
  });

  it("見出しの下端を越えたら隠れた扱い", () => {
    expect(isHeadingScrolledPast(64, 64)).toBe(true);
    expect(isHeadingScrolledPast(200, 64)).toBe(true);
  });

  it("引っ張って上へはみ出した（負のオフセット）ときは隠れていない", () => {
    expect(isHeadingScrolledPast(-80, 64)).toBe(false);
  });
});
