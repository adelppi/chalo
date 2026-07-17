import type { LogEntry } from "./types";

// NDJSON のシリアライズ（adr/0011）。1行1 JSON。
// JSON.stringify は文字列中の改行を \n にエスケープするため、行が壊れることはない。

export function serializeLogEntry(entry: LogEntry): string {
  return JSON.stringify(entry);
}

/** NDJSON テキストを行に分ける。空行は無視する */
export function splitLogLines(text: string): string[] {
  return text.split("\n").filter((line) => line.trim().length > 0);
}

/** 行の配列を NDJSON テキストへ戻す（末尾に改行を付ける） */
export function joinLogLines(lines: string[]): string {
  return lines.length > 0 ? `${lines.join("\n")}\n` : "";
}
