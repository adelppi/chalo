import { describe, expect, it } from "@jest/globals";

import { photoDotWindow } from "./dots";

describe("photoDotWindow", () => {
  it("最大数以下なら全部のドットを出す", () => {
    expect(photoDotWindow(0, 3)).toEqual([0, 1, 2]);
    expect(photoDotWindow(4, 5)).toEqual([0, 1, 2, 3, 4]);
  });

  it("多いときは現在位置を中心にした窓に絞る", () => {
    // 18枚の3枚目 → 0..4 の窓（先頭に寄せる）
    expect(photoDotWindow(2, 18)).toEqual([0, 1, 2, 3, 4]);
    // 中ほどは中央に来る
    expect(photoDotWindow(9, 18)).toEqual([7, 8, 9, 10, 11]);
  });

  it("末尾でも窓の幅を保つ（はみ出さない）", () => {
    expect(photoDotWindow(17, 18)).toEqual([13, 14, 15, 16, 17]);
  });

  it("写真が無ければ空", () => {
    expect(photoDotWindow(0, 0)).toEqual([]);
  });
});
