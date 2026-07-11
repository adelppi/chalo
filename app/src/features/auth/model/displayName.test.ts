import { describe, expect, it } from "@jest/globals";

import { formatAppleFullName, resolveDisplayName } from "./displayName";

describe("formatAppleFullName", () => {
  it("姓→名の順で結合する", () => {
    expect(formatAppleFullName({ givenName: "太郎", familyName: "山田" })).toBe(
      "山田 太郎",
    );
  });

  it("片方だけならその1つを返す", () => {
    expect(formatAppleFullName({ givenName: "太郎", familyName: null })).toBe(
      "太郎",
    );
    expect(formatAppleFullName({ givenName: null, familyName: "山田" })).toBe(
      "山田",
    );
  });

  it("空白のみは無視する", () => {
    expect(
      formatAppleFullName({ givenName: "  ", familyName: "  " }),
    ).toBeNull();
  });

  it("null / undefined なら null", () => {
    expect(formatAppleFullName(null)).toBeNull();
    expect(formatAppleFullName(undefined)).toBeNull();
  });
});

describe("resolveDisplayName", () => {
  it("氏名ヒントがあればそれを使う", () => {
    expect(
      resolveDisplayName({ nameHint: "山田 太郎", email: "taro@example.com" }),
    ).toBe("山田 太郎");
  });

  it("氏名ヒントの前後の空白を除去する", () => {
    expect(resolveDisplayName({ nameHint: "  花子  ", email: null })).toBe(
      "花子",
    );
  });

  it("氏名ヒントが空ならメールのローカル部を使う", () => {
    expect(
      resolveDisplayName({ nameHint: "", email: "hanako@example.com" }),
    ).toBe("hanako");
    expect(
      resolveDisplayName({ nameHint: "   ", email: "hanako@example.com" }),
    ).toBe("hanako");
    expect(
      resolveDisplayName({ nameHint: null, email: "hanako@example.com" }),
    ).toBe("hanako");
  });

  it("氏名もメールも無ければ既定値", () => {
    expect(resolveDisplayName({ nameHint: null, email: null })).toBe(
      "ユーザー",
    );
    expect(resolveDisplayName({ nameHint: undefined, email: undefined })).toBe(
      "ユーザー",
    );
  });
});
