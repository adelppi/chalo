import { describe, expect, it } from "@jest/globals";

import {
  isReleaseVersion,
  selectVersionBumpCommits,
  tagMessageFor,
  tagNameFor,
} from "./version-bump-commit";

describe("isReleaseVersion", () => {
  it("x.y.z を受け入れる", () => {
    expect(isReleaseVersion("1.2.0")).toBe(true);
    expect(isReleaseVersion("10.0.11")).toBe(true);
  });

  it("v 付き・桁不足・プレリリースは受け入れない", () => {
    expect(isReleaseVersion("v1.2.0")).toBe(false);
    expect(isReleaseVersion("1.2")).toBe(false);
    expect(isReleaseVersion("1.2.0-beta.1")).toBe(false);
    expect(isReleaseVersion("")).toBe(false);
    expect(isReleaseVersion(undefined)).toBe(false);
  });
});

describe("tagNameFor / tagMessageFor", () => {
  it("vX.Y.Z と vX.Y.Z release を作る", () => {
    expect(tagNameFor("1.2.0")).toBe("v1.2.0");
    expect(tagMessageFor("1.2.0")).toBe("v1.2.0 release");
  });
});

describe("selectVersionBumpCommits", () => {
  // 新しい順。main の一次系列上で app/package.json が変わったコミットを想定する。
  const history = [
    { sha: "ccc", version: "1.2.0", parentVersion: "1.1.0" },
    { sha: "bbb", version: "1.1.0", parentVersion: "1.0.0" },
    { sha: "aaa", version: "1.0.0", parentVersion: null },
  ];

  it("版が切り替わったコミットを返す", () => {
    expect(selectVersionBumpCommits(history, "1.2.0")).toEqual(["ccc"]);
    expect(selectVersionBumpCommits(history, "1.1.0")).toEqual(["bbb"]);
  });

  it("親に package.json が無い最初のコミットも切り替わりとして扱う", () => {
    expect(selectVersionBumpCommits(history, "1.0.0")).toEqual(["aaa"]);
  });

  it("版を変えていないコミットは選ばない", () => {
    const withNoop = [
      { sha: "ddd", version: "1.2.0", parentVersion: "1.2.0" },
      ...history,
    ];
    expect(selectVersionBumpCommits(withNoop, "1.2.0")).toEqual(["ccc"]);
  });

  it("履歴に無い版では空を返す", () => {
    expect(selectVersionBumpCommits(history, "9.9.9")).toEqual([]);
  });

  it("差し戻して上げ直した版は複数返す(呼び出し側で止める)", () => {
    const reverted = [
      { sha: "fff", version: "1.3.0", parentVersion: "1.2.0" },
      { sha: "eee", version: "1.2.0", parentVersion: "1.3.0" },
      { sha: "ddd", version: "1.3.0", parentVersion: "1.2.0" },
      ...history,
    ];
    expect(selectVersionBumpCommits(reverted, "1.3.0")).toEqual(["fff", "ddd"]);
  });
});
