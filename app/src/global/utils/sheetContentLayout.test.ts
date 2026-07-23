import { describe, expect, it } from "@jest/globals";

import { resolveSheetContentLayout } from "./sheetContentLayout";

describe("resolveSheetContentLayout", () => {
  it("未測定のあいだは高さを指定せず、スクロールもさせない", () => {
    expect(
      resolveSheetContentLayout({ measuredHeight: null, maxHeight: 600 }),
    ).toEqual({ height: undefined, scrollable: false });
  });

  it("上限に収まる中身は測った高さをそのまま使う", () => {
    expect(
      resolveSheetContentLayout({ measuredHeight: 320, maxHeight: 600 }),
    ).toEqual({ height: 320, scrollable: false });
  });

  it("上限を超える中身は上限で頭打ちにしてスクロールさせる", () => {
    expect(
      resolveSheetContentLayout({ measuredHeight: 1200, maxHeight: 600 }),
    ).toEqual({ height: 600, scrollable: true });
  });

  it("ちょうど上限のときは超過側に含める（スクロール量は 0 になる）", () => {
    expect(
      resolveSheetContentLayout({ measuredHeight: 600, maxHeight: 600 }),
    ).toEqual({ height: 600, scrollable: true });
  });
});
