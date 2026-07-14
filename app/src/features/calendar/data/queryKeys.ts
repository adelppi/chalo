// TanStack Query の queryKey 規約（adr/0003）。無効化・再取得はここを基準にする。
export const calendarKeys = {
  all: ["calendar"] as const,
  permission: ["calendar", "permission"] as const,
  calendars: ["calendar", "calendars"] as const,
  defaultCalendar: ["calendar", "default-calendar"] as const,
  systemDefaultCalendar: ["calendar", "system-default-calendar"] as const,
  link: (planId: string) => ["calendar", "link", planId] as const,
};
