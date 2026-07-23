import { describe, expect, it } from "@jest/globals";

import { shouldClearKeyboardTarget } from "./sheetKeyboardTarget";

const MEMO = 1;
const URL = 2;
const OUTSIDE = 9;
const SHEET_NODES = new Set([MEMO, URL]);

describe("shouldClearKeyboardTarget", () => {
  it("覚えている入力欄が blur し、どこにもフォーカスが無ければ消す", () => {
    expect(
      shouldClearKeyboardTarget({
        keyboardTarget: MEMO,
        blurredNode: MEMO,
        focusedNode: null,
        sheetNodes: SHEET_NODES,
      }),
    ).toBe(true);
  });

  it("同じシート内の別の入力欄へ移っただけなら消さない", () => {
    expect(
      shouldClearKeyboardTarget({
        keyboardTarget: MEMO,
        blurredNode: MEMO,
        focusedNode: URL,
        sheetNodes: SHEET_NODES,
      }),
    ).toBe(false);
  });

  it("シート外の入力欄へ移ったなら消す", () => {
    expect(
      shouldClearKeyboardTarget({
        keyboardTarget: MEMO,
        blurredNode: MEMO,
        focusedNode: OUTSIDE,
        sheetNodes: SHEET_NODES,
      }),
    ).toBe(true);
  });

  it("覚えている入力欄と別の入力欄が blur しても消さない", () => {
    expect(
      shouldClearKeyboardTarget({
        keyboardTarget: MEMO,
        blurredNode: URL,
        focusedNode: null,
        sheetNodes: SHEET_NODES,
      }),
    ).toBe(false);
  });

  it("まだ何も覚えていなければ消さない", () => {
    expect(
      shouldClearKeyboardTarget({
        keyboardTarget: undefined,
        blurredNode: MEMO,
        focusedNode: null,
        sheetNodes: SHEET_NODES,
      }),
    ).toBe(false);
  });
});
