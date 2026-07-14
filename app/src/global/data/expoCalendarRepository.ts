import * as Calendar from "expo-calendar/legacy";

import type {
  CalendarEventInput,
  CalendarPermission,
  DeviceCalendar,
  DeviceCalendarRepository,
} from "@features/calendar";

// 端末カレンダー（EventKit）の expo-calendar 実装（adr/0012）。
// イベント ID 指定の取得・更新・削除が揃う legacy API を使う。

function toPermission(
  response: Calendar.PermissionResponse,
): CalendarPermission {
  if (response.status === "granted") {
    return "granted";
  }
  if (response.status === "undetermined") {
    return "undetermined";
  }
  return "denied";
}

// ネイティブ側の Event は location に null を受け付けない（SDK 57 legacy）。
// 空文字にすると「場所なし」になり、更新時のクリアも兼ねる。
function toEventDetails(event: CalendarEventInput) {
  return {
    title: event.title,
    notes: event.notes,
    location: event.location ?? "",
    startDate: event.startDate,
    endDate: event.endDate,
    allDay: event.allDay,
  };
}

export const expoCalendarRepository: DeviceCalendarRepository = {
  async getPermission(): Promise<CalendarPermission> {
    return toPermission(await Calendar.getCalendarPermissionsAsync());
  },

  async requestPermission(): Promise<CalendarPermission> {
    return toPermission(await Calendar.requestCalendarPermissionsAsync());
  },

  async listCalendars(): Promise<DeviceCalendar[]> {
    const calendars = await Calendar.getCalendarsAsync(
      Calendar.EntityTypes.EVENT,
    );
    return calendars
      .filter((calendar) => calendar.allowsModifications)
      .map((calendar) => ({
        id: calendar.id,
        title: calendar.title,
        color: calendar.color ?? null,
        allowsModifications: calendar.allowsModifications,
      }));
  },

  async getSystemDefaultCalendarId(): Promise<string | null> {
    try {
      const calendar = await Calendar.getDefaultCalendarAsync();
      return calendar.id;
    } catch {
      return null;
    }
  },

  async createEvent(
    calendarId: string,
    event: CalendarEventInput,
  ): Promise<string> {
    return Calendar.createEventAsync(calendarId, toEventDetails(event));
  },

  async updateEvent(eventId: string, event: CalendarEventInput): Promise<void> {
    await Calendar.updateEventAsync(eventId, toEventDetails(event));
  },

  async deleteEvent(eventId: string): Promise<void> {
    await Calendar.deleteEventAsync(eventId);
  },

  async eventExists(eventId: string): Promise<boolean> {
    // 外部（端末カレンダーアプリ）で手動削除されていると取得が失敗する
    try {
      await Calendar.getEventAsync(eventId);
      return true;
    } catch {
      return false;
    }
  },
};
