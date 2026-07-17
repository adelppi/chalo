// 行単位ローテーション（adr/0011）。保持は 30日 かつ 2MB 上限で、
// 先に当たった方から古い行を破棄する。

export const MAX_LOG_AGE_DAYS = 30;
export const MAX_LOG_BYTES = 2 * 1024 * 1024;

/** UTF-8 でのバイト数（TextEncoder に依存せず Jest / Hermes 両方で動く） */
export function utf8ByteLength(text: string): number {
  let bytes = 0;
  for (const char of text) {
    const codePoint = char.codePointAt(0) ?? 0;
    if (codePoint <= 0x7f) {
      bytes += 1;
    } else if (codePoint <= 0x7ff) {
      bytes += 2;
    } else if (codePoint <= 0xffff) {
      bytes += 3;
    } else {
      bytes += 4;
    }
  }
  return bytes;
}

/** NDJSON 行から ts（エポックms）を取り出す。壊れた行は null */
export function parseLineTimestamp(line: string): number | null {
  try {
    const parsed: unknown = JSON.parse(line);
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }
    const ts = (parsed as { ts?: unknown }).ts;
    if (typeof ts !== "string") {
      return null;
    }
    const epoch = Date.parse(ts);
    return Number.isNaN(epoch) ? null : epoch;
  } catch {
    return null;
  }
}

/**
 * 保持基準を超えた古い行を破棄する。
 * 1. 30日より古い行（と ts を読めない壊れた行）を捨てる
 * 2. 全体が 2MB を超える分だけ、古い行から捨てる（新しい行を優先して残す）
 */
export function rotateLogLines(lines: string[], now: Date): string[] {
  const oldestAllowed = now.getTime() - MAX_LOG_AGE_DAYS * 24 * 60 * 60 * 1000;
  const fresh = lines.filter((line) => {
    const ts = parseLineTimestamp(line);
    return ts !== null && ts >= oldestAllowed;
  });

  // 新しい側（末尾）から 2MB に収まるまで採用し、順序を保って返す
  let budget = MAX_LOG_BYTES;
  let start = fresh.length;
  for (let i = fresh.length - 1; i >= 0; i--) {
    const cost = utf8ByteLength(fresh[i]) + 1; // +1 は改行分
    if (cost > budget) {
      break;
    }
    budget -= cost;
    start = i;
  }
  return fresh.slice(start);
}
