import { describe, expect, it } from "@jest/globals";

import { formatPhotoCounter, formatTakenAt } from "./format";

describe("formatTakenAt", () => {
  it("撮影日時を「M月D日 HH:mm」で返す（端末ローカル）", () => {
    const takenAt = new Date(2026, 6, 12, 14, 32).getTime();
    expect(formatTakenAt(takenAt)).toBe("7月12日 14:32");
  });

  it("時・分は2桁に揃える", () => {
    const takenAt = new Date(2026, 0, 3, 9, 5).getTime();
    expect(formatTakenAt(takenAt)).toBe("1月3日 09:05");
  });

  it("撮影日時を持たない写真は null", () => {
    expect(formatTakenAt(null)).toBeNull();
    expect(formatTakenAt(Number.NaN)).toBeNull();
  });
});

describe("formatPhotoCounter", () => {
  it("0 始まりの index を 1 始まりで見せる", () => {
    expect(formatPhotoCounter(2, 18)).toBe("3 / 18");
    expect(formatPhotoCounter(0, 1)).toBe("1 / 1");
  });
});
