import { describe, expect, it } from "@jest/globals";

import { joinLogLines, serializeLogEntry, splitLogLines } from "./serialize";
import type { LogEntry } from "./types";

describe("serializeLogEntry", () => {
  it("1行の JSON になる（NDJSON）", () => {
    const entry: LogEntry = {
      ts: "2026-07-17T10:00:00.000Z",
      level: "info",
      event: "plan_create",
      ids: { planId: "5f0c2c74-0000-4000-8000-000000000001" },
    };
    const lineText = serializeLogEntry(entry);
    expect(lineText).not.toContain("\n");
    expect(JSON.parse(lineText)).toEqual(entry);
  });

  it("スタックトレース中の改行はエスケープされ、行が壊れない", () => {
    const entry: LogEntry = {
      ts: "2026-07-17T10:00:00.000Z",
      level: "error",
      event: "unhandled_error",
      error: { name: "TypeError", stack: "line1\nline2\nline3" },
    };
    const lineText = serializeLogEntry(entry);
    expect(lineText.split("\n")).toHaveLength(1);
    expect((JSON.parse(lineText) as LogEntry).error?.stack).toBe(
      "line1\nline2\nline3",
    );
  });
});

describe("splitLogLines / joinLogLines", () => {
  it("往復して元に戻る（末尾改行付き）", () => {
    const lines = ['{"a":1}', '{"b":2}'];
    expect(splitLogLines(joinLogLines(lines))).toEqual(lines);
    expect(joinLogLines(lines).endsWith("\n")).toBe(true);
  });

  it("空テキスト・空行は無視する", () => {
    expect(splitLogLines("")).toEqual([]);
    expect(splitLogLines('{"a":1}\n\n{"b":2}\n')).toEqual([
      '{"a":1}',
      '{"b":2}',
    ]);
    expect(joinLogLines([])).toBe("");
  });
});
