import { AppState } from "react-native";

import { readLogFileText, writeLogFileText } from "./logFile";
import { rotateLogLines } from "./rotation";
import { buildLogEntry } from "./sanitize";
import { joinLogLines, serializeLogEntry, splitLogLines } from "./serialize";
import type { LogFields, LogLevel } from "./types";

// 端末内ログの本体（adr/0011・features.md 11.4）。
// - メモリ上のリングバッファに溜め、バックグラウンド移行時にまとめて追記する
// - error レベルは即フラッシュする（クラッシュ直前の取りこぼし防止）
// - 書き込み失敗はすべて握りつぶす（アプリ動作に影響させない。non-functional.md）

/** バッファの上限行数。あふれたら古い行から捨てる（リングバッファ） */
const MAX_BUFFER_ENTRIES = 500;

let buffer: string[] = [];
let initialized = false;

/**
 * ログを1行記録する。内容ゼロ方式のフィルタ（sanitize.ts）を通るため、
 * ここに自由文を渡しても記録されない。
 */
export function log(level: LogLevel, event: string, fields?: LogFields): void {
  try {
    const entry = buildLogEntry(new Date(), level, event, fields);
    buffer.push(serializeLogEntry(entry));
    if (buffer.length > MAX_BUFFER_ENTRIES) {
      buffer.splice(0, buffer.length - MAX_BUFFER_ENTRIES);
    }
    if (level === "error") {
      flushLogs();
    }
  } catch {
    // ログはアプリ動作に影響させない
  }
}

/** バッファをファイルへ追記し、30日・2MB でローテーションする */
export function flushLogs(): void {
  try {
    if (buffer.length === 0) {
      return;
    }
    const pending = buffer;
    buffer = [];
    const lines = splitLogLines(readLogFileText()).concat(pending);
    writeLogFileText(joinLogLines(rotateLogLines(lines, new Date())));
  } catch {
    // 書き込み失敗は握りつぶす（バッファは捨てる。次の記録からやり直す）
  }
}

/**
 * 不具合報告（9.8）用に、いまのバッファをフラッシュした上で
 * 端末にあるログ全文（最大30日 / 2MB）を NDJSON のまま返す。
 */
export function readLogsForReport(): string {
  flushLogs();
  return readLogFileText();
}

type GlobalErrorHandler = (error: unknown, isFatal?: boolean) => void;
type ErrorUtilsLike = {
  getGlobalHandler: () => GlobalErrorHandler;
  setGlobalHandler: (handler: GlobalErrorHandler) => void;
};

/**
 * 起動時に1回だけ呼ぶ。グローバル未捕捉エラーの記録・AppState による
 * フラッシュ契機・起動/復帰イベントを結線する。
 */
export function setupLogging(): void {
  if (initialized) {
    return;
  }
  initialized = true;

  // 未捕捉エラーを error で記録してから、元のハンドラ（RedBox / クラッシュ）へ渡す
  const errorUtils = (globalThis as { ErrorUtils?: ErrorUtilsLike }).ErrorUtils;
  if (errorUtils) {
    const previousHandler = errorUtils.getGlobalHandler();
    errorUtils.setGlobalHandler((error, isFatal) => {
      log("error", "unhandled_error", {
        error,
        detail: isFatal ? "fatal" : "non-fatal",
      });
      previousHandler(error, isFatal);
    });
  }

  // BG 移行でまとめて追記（adr/0011）。復帰は同期タイミングの手がかりとして残す
  AppState.addEventListener("change", (state) => {
    if (state === "background") {
      log("info", "app_background");
      flushLogs();
    } else if (state === "active") {
      log("info", "app_foreground");
    }
  });

  log("info", "app_launch");
}
