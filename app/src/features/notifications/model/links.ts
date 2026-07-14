// 期限通知の予約対応表（{ planId → notificationId }）の変換。純粋関数（adr/0014）。
// 保存形式は planId をキーにした JSON マップ（data-model.md「期限通知の予約」。保存先は AsyncStorage）。

import type { DeadlineNotificationLink } from "./types";

type StoredLinks = Record<string, { notificationId: string }>;

/** 保存文字列 → 対応表。壊れていたら空として扱う（予約は組み直せる） */
export function parseDeadlineNotificationLinks(
  raw: string | null,
): StoredLinks {
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
        typeof (value as { notificationId?: unknown }).notificationId ===
          "string"
      ) {
        links[planId] = {
          notificationId: (value as { notificationId: string }).notificationId,
        };
      }
    }
    return links;
  } catch {
    return {};
  }
}

export function serializeDeadlineNotificationLinks(links: StoredLinks): string {
  return JSON.stringify(links);
}

/** 対応表から予約を引く。無ければ null（＝未予約） */
export function findDeadlineNotificationLink(
  links: StoredLinks,
  planId: string,
): DeadlineNotificationLink | null {
  const entry = links[planId];
  return entry ? { planId, ...entry } : null;
}

export function upsertDeadlineNotificationLink(
  links: StoredLinks,
  link: DeadlineNotificationLink,
): StoredLinks {
  return {
    ...links,
    [link.planId]: { notificationId: link.notificationId },
  };
}

export function removeDeadlineNotificationLink(
  links: StoredLinks,
  planId: string,
): StoredLinks {
  const { [planId]: _removed, ...rest } = links;
  return rest;
}
