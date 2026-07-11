// タイムゾーン解決。profiles.timezone（NOT NULL）を端末から自動取得する（domain/onboarding.md）。

const FALLBACK_TIMEZONE = "Asia/Tokyo";

// 端末から得た生の TZ 文字列を正規化する（純粋関数）。
// 空・未定義なら既定値にフォールバックする。
export function normalizeTimezone(raw: string | null | undefined): string {
  const value = raw?.trim();
  return value ? value : FALLBACK_TIMEZONE;
}

// 端末の現在のタイムゾーンを返す。Intl を読むため副作用側に置く薄いラッパー。
export function getDeviceTimezone(): string {
  return normalizeTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
}
