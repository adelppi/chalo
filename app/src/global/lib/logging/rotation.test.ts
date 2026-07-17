import { describe, expect, it } from "@jest/globals";

import {
  MAX_LOG_BYTES,
  parseLineTimestamp,
  rotateLogLines,
  utf8ByteLength,
} from "./rotation";

const NOW = new Date("2026-07-17T10:00:00.000Z");

function line(ts: string, padding = ""): string {
  return JSON.stringify({ ts, level: "info", event: "e", detail: padding });
}

describe("utf8ByteLength", () => {
  it("ASCII は1文字1バイト", () => {
    expect(utf8ByteLength("abc")).toBe(3);
  });

  it("日本語は3バイト、絵文字（サロゲートペア）は4バイト", () => {
    expect(utf8ByteLength("あ")).toBe(3);
    expect(utf8ByteLength("😀")).toBe(4);
  });

  it("空文字は0", () => {
    expect(utf8ByteLength("")).toBe(0);
  });
});

describe("parseLineTimestamp", () => {
  it("ts を エポックms で返す", () => {
    expect(parseLineTimestamp(line("2026-07-17T09:00:00.000Z"))).toBe(
      Date.parse("2026-07-17T09:00:00.000Z"),
    );
  });

  it("JSON でない行・ts の無い行・不正な ts は null", () => {
    expect(parseLineTimestamp("壊れた行")).toBeNull();
    expect(parseLineTimestamp("{}")).toBeNull();
    expect(parseLineTimestamp(JSON.stringify({ ts: "not-a-date" }))).toBeNull();
    expect(parseLineTimestamp(JSON.stringify({ ts: 123 }))).toBeNull();
    expect(parseLineTimestamp("null")).toBeNull();
  });
});

describe("rotateLogLines", () => {
  it("30日以内の行は残る", () => {
    const lines = [
      line("2026-06-18T10:00:00.000Z"), // 29日前
      line("2026-07-17T09:00:00.000Z"),
    ];
    expect(rotateLogLines(lines, NOW)).toEqual(lines);
  });

  it("30日より古い行は捨てる", () => {
    const old = line("2026-06-16T09:59:59.000Z"); // 31日前
    const fresh = line("2026-07-17T09:00:00.000Z");
    expect(rotateLogLines([old, fresh], NOW)).toEqual([fresh]);
  });

  it("ちょうど30日前の行は残る（境界）", () => {
    const boundary = line("2026-06-17T10:00:00.000Z");
    expect(rotateLogLines([boundary], NOW)).toEqual([boundary]);
  });

  it("壊れた行（ts を読めない）は捨てる", () => {
    const fresh = line("2026-07-17T09:00:00.000Z");
    expect(rotateLogLines(["壊れた行", fresh], NOW)).toEqual([fresh]);
  });

  it("2MB を超えたら古い行から捨て、新しい行を順序を保って残す", () => {
    // 1行あたり約 512KB × 5行 = 約 2.5MB → 古い1〜2行が落ちる
    const padding = "x".repeat(512 * 1024);
    const lines = [0, 1, 2, 3, 4].map((i) =>
      line(`2026-07-17T0${i}:00:00.000Z`, padding),
    );
    const kept = rotateLogLines(lines, NOW);
    expect(kept.length).toBeLessThan(lines.length);
    expect(kept).toEqual(lines.slice(lines.length - kept.length));
    const totalBytes = kept.reduce((sum, l) => sum + utf8ByteLength(l) + 1, 0);
    expect(totalBytes).toBeLessThanOrEqual(MAX_LOG_BYTES);
  });

  it("2MB 以内ならそのまま", () => {
    const lines = [
      line("2026-07-17T08:00:00.000Z"),
      line("2026-07-17T09:00:00.000Z"),
    ];
    expect(rotateLogLines(lines, NOW)).toEqual(lines);
  });
});
