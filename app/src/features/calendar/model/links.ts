// カレンダーリンク対応表（{ planId → eventId, calendarId }）の変換。純粋関数（adr/0014）。
// 保存形式は planId をキーにした JSON マップ（adr/0012。保存先は AsyncStorage）。

import type { CalendarLink } from "./types";

type StoredLinks = Record<string, { eventId: string; calendarId: string }>;

/** 保存文字列 → 対応表。壊れていたら空として扱う（リンクは作り直せる） */
export function parseCalendarLinks(raw: string | null): StoredLinks {
  if (!raw) {
    return {};
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {};
    }
    const links: StoredLinks = {};
    for (const [planId, value] of Object.entries(parsed)) {
      if (
        typeof value === "object" &&
        value !== null &&
        typeof (value as { eventId?: unknown }).eventId === "string" &&
        typeof (value as { calendarId?: unknown }).calendarId === "string"
      ) {
        links[planId] = {
          eventId: (value as { eventId: string }).eventId,
          calendarId: (value as { calendarId: string }).calendarId,
        };
      }
    }
    return links;
  } catch {
    return {};
  }
}

export function serializeCalendarLinks(links: StoredLinks): string {
  return JSON.stringify(links);
}

/** 対応表からリンクを引く。無ければ null（＝未連携） */
export function findCalendarLink(
  links: StoredLinks,
  planId: string,
): CalendarLink | null {
  const entry = links[planId];
  return entry ? { planId, ...entry } : null;
}

export function upsertCalendarLink(
  links: StoredLinks,
  link: CalendarLink,
): StoredLinks {
  return {
    ...links,
    [link.planId]: { eventId: link.eventId, calendarId: link.calendarId },
  };
}

export function removeCalendarLink(
  links: StoredLinks,
  planId: string,
): StoredLinks {
  const { [planId]: _removed, ...rest } = links;
  return rest;
}
