import type { LogEntry, LogErrorInfo, LogFields, LogLevel } from "./types";

// 内容ゼロ方式のフィルタ（adr/0011「ログに含めない情報」）。
// ユーザー入力が混入しうる自由文は正規表現で弾き、通ったものだけを記録する。
// エラーは種別（name・code）とスタックのみ残し、message は値が混ざりうるため捨てる。

/** UUID（バージョン不問）。プラン・ペア等の ID はこれ以外を記録しない */
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** イベント名・detail に許すトークン（snake_case / kebab-case / 数字） */
const TOKEN_PATTERN = /^[a-z0-9_-]{1,64}$/;

/** ids のキーに許すトークン（camelCase を含む英数字） */
const ID_KEY_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

/** 画面名（expo-router のルート名）。() [] / と英数字のみ許す */
const SCREEN_PATTERN = /^[a-zA-Z0-9_\-/()[\]+.]{1,128}$/;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

/** UUID の値だけを残す。キーもトークン形式に限る */
export function sanitizeIds(
  ids: Record<string, string> | undefined,
): Record<string, string> | undefined {
  if (!ids) {
    return undefined;
  }
  const entries = Object.entries(ids).filter(
    ([key, value]) => ID_KEY_PATTERN.test(key) && UUID_PATTERN.test(value),
  );
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

/**
 * スタックトレースから呼び出し位置の行（"at …"）だけを残す。
 * V8 / Hermes の stack は1行目に message を含むため、そのままでは
 * ユーザー入力が混入しうる（内容ゼロ方式が破れる）。
 */
function sanitizeStack(stack: string): string | undefined {
  const frames = stack
    .split("\n")
    .filter((frame) => /^\s*at /.test(frame))
    .map((frame) => frame.trim());
  return frames.length > 0 ? frames.join("\n") : undefined;
}

/** エラーから種別とスタックだけを抜き出す。message は記録しない */
export function sanitizeError(error: unknown): LogErrorInfo | undefined {
  if (error === undefined || error === null) {
    return undefined;
  }
  if (error instanceof Error) {
    const code = (error as { code?: unknown }).code;
    const stack = error.stack ? sanitizeStack(error.stack) : undefined;
    return {
      name: error.name,
      ...(typeof code === "string" ? { code } : {}),
      ...(stack ? { stack } : {}),
    };
  }
  // Supabase の PostgrestError 等、Error を継承しないオブジェクトも拾う
  if (typeof error === "object") {
    const { name, code } = error as { name?: unknown; code?: unknown };
    return {
      name: typeof name === "string" ? name : "UnknownError",
      ...(typeof code === "string" ? { code } : {}),
    };
  }
  return { name: "UnknownError" };
}

/**
 * ログ1行分を組み立てる。許可された形式に合わないフィールドは黙って落とす
 * （記録できない情報がアプリ動作を妨げないため。non-functional.md）。
 */
export function buildLogEntry(
  now: Date,
  level: LogLevel,
  event: string,
  fields?: LogFields,
): LogEntry {
  const ids = sanitizeIds(fields?.ids);
  const error =
    fields?.error !== undefined ? sanitizeError(fields.error) : undefined;
  return {
    ts: now.toISOString(),
    level,
    event: TOKEN_PATTERN.test(event) ? event : "invalid_event",
    ...(fields?.screen && SCREEN_PATTERN.test(fields.screen)
      ? { screen: fields.screen }
      : {}),
    ...(ids ? { ids } : {}),
    ...(fields?.detail && TOKEN_PATTERN.test(fields.detail)
      ? { detail: fields.detail }
      : {}),
    ...(error ? { error } : {}),
  };
}

/**
 * 画面遷移ログ（features.md 11.4）。ルート名は useSegments() のセグメント
 * （動的部分は "[id]" のままで値を含まない）、params は UUID のみ通す。
 */
export function buildScreenViewFields(
  segments: string[],
  params: Record<string, unknown>,
): LogFields {
  const uuidEntries = Object.entries(params).filter(
    (entry): entry is [string, string] =>
      typeof entry[1] === "string" && UUID_PATTERN.test(entry[1]),
  );
  return {
    screen: segments.length > 0 ? segments.join("/") : "(root)",
    ...(uuidEntries.length > 0 ? { ids: Object.fromEntries(uuidEntries) } : {}),
  };
}
