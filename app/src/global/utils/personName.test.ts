import { describe, expect, it } from "@jest/globals";

import {
  type NameViewer,
  resolvePartnerName,
  resolvePersonName,
} from "./personName";

const ME = "profile-me";
const PARTNER = "profile-partner";

function viewer(partnerNickname: string | null): NameViewer {
  return { viewerId: ME, partnerNickname };
}

describe("resolvePartnerName", () => {
  it("よびかたがあればそれを使う", () => {
    expect(resolvePartnerName("ゆいちゃん", "ゆい")).toBe("ゆいちゃん");
  });

  it("よびかたが未設定なら相手の表示名", () => {
    expect(resolvePartnerName(null, "ゆい")).toBe("ゆい");
  });

  it("よびかたが空欄・空白のみなら相手の表示名", () => {
    expect(resolvePartnerName("", "ゆい")).toBe("ゆい");
    expect(resolvePartnerName("   ", "ゆい")).toBe("ゆい");
  });

  it("前後の空白は除去する", () => {
    expect(resolvePartnerName("  ゆいちゃん  ", "ゆい")).toBe("ゆいちゃん");
  });
});

describe("resolvePersonName", () => {
  it("相手にはよびかたを適用する", () => {
    expect(
      resolvePersonName(
        { id: PARTNER, displayName: "ゆい" },
        viewer("ゆいちゃん"),
      ),
    ).toBe("ゆいちゃん");
  });

  it("自分にはよびかたを適用しない（常に表示名）", () => {
    expect(
      resolvePersonName(
        { id: ME, displayName: "そうた" },
        viewer("ゆいちゃん"),
      ),
    ).toBe("そうた");
  });

  it("よびかたが未設定なら相手の表示名", () => {
    expect(
      resolvePersonName({ id: PARTNER, displayName: "ゆい" }, viewer(null)),
    ).toBe("ゆい");
  });

  it("よびかたが空欄なら相手の表示名", () => {
    expect(
      resolvePersonName({ id: PARTNER, displayName: "ゆい" }, viewer("  ")),
    ).toBe("ゆい");
  });

  it("表示名が読めなくても、よびかたがあればそれを使う", () => {
    expect(
      resolvePersonName(
        { id: PARTNER, displayName: null },
        viewer("ゆいちゃん"),
      ),
    ).toBe("ゆいちゃん");
  });

  it("表示名が読めず、よびかたも無ければ null", () => {
    expect(
      resolvePersonName({ id: PARTNER, displayName: null }, viewer(null)),
    ).toBeNull();
    expect(
      resolvePersonName({ id: ME, displayName: null }, viewer("x")),
    ).toBeNull();
  });
});
