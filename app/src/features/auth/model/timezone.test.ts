import { describe, expect, it } from "@jest/globals";

import { normalizeTimezone } from "./timezone";

describe("normalizeTimezone", () => {
  it("有効な TZ 文字列はそのまま返す", () => {
    expect(normalizeTimezone("America/New_York")).toBe("America/New_York");
  });

  it("前後の空白を除去する", () => {
    expect(normalizeTimezone("  Asia/Tokyo  ")).toBe("Asia/Tokyo");
  });

  it("空・null・undefined は既定値にフォールバックする", () => {
    expect(normalizeTimezone("")).toBe("Asia/Tokyo");
    expect(normalizeTimezone("   ")).toBe("Asia/Tokyo");
    expect(normalizeTimezone(null)).toBe("Asia/Tokyo");
    expect(normalizeTimezone(undefined)).toBe("Asia/Tokyo");
  });
});
