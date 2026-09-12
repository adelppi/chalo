import { describe, expect, it } from "@jest/globals";

import { albumEmptyReason, albumTileSize } from "./grid";

describe("albumTileSize", () => {
  it("列間の隙間を引いた残りを等分する", () => {
    // 幅 342 = 隙間 6×2 を引いた 330 を3等分して 110
    expect(albumTileSize(342)).toBe(110);
  });

  it("割り切れないときは切り捨てて最終列をはみ出させない", () => {
    // 幅 344 → (344 - 12) / 3 = 110.67
    expect(albumTileSize(344)).toBe(110);
  });

  it("列数と隙間を変えられる", () => {
    expect(albumTileSize(100, 2, 10)).toBe(45);
  });

  it("幅が隙間に満たないときは 0 を返す", () => {
    expect(albumTileSize(10)).toBe(0);
    expect(albumTileSize(0)).toBe(0);
  });
});

describe("albumEmptyReason", () => {
  it("写真が1枚でもあれば空表示は出さない", () => {
    expect(albumEmptyReason("all", 1)).toBe("none");
    expect(albumEmptyReason("limited", 1)).toBe("none");
  });

  it("全許可で0件なら、その日に撮らなかっただけ", () => {
    expect(albumEmptyReason("all", 0)).toBe("no-photos");
  });

  it("限定アクセスで0件なら、見えていない可能性を伝える", () => {
    expect(albumEmptyReason("limited", 0)).toBe("limited");
  });

  it("拒否・未要求はそれぞれの導線に振り分ける", () => {
    expect(albumEmptyReason("denied", 0)).toBe("denied");
    expect(albumEmptyReason("undetermined", 0)).toBe("undetermined");
  });
});
