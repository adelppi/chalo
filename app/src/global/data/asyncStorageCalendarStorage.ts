import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  CalendarLink,
  CalendarStorageRepository,
} from "@features/calendar";
import {
  findCalendarLink,
  parseCalendarLinks,
  removeCalendarLink,
  serializeCalendarLinks,
  upsertCalendarLink,
} from "@features/calendar";

// カレンダーリンク（{ planId → eventId, calendarId }）と既定カレンダー設定の
// AsyncStorage 実装。クラウドには置かない（adr/0012・data-model.md）。

const LINKS_KEY = "calendar.links";
const DEFAULT_CALENDAR_KEY = "calendar.default-calendar-id";

export const asyncStorageCalendarStorage: CalendarStorageRepository = {
  async getLink(planId: string): Promise<CalendarLink | null> {
    const links = parseCalendarLinks(await AsyncStorage.getItem(LINKS_KEY));
    return findCalendarLink(links, planId);
  },

  async saveLink(link: CalendarLink): Promise<void> {
    const links = parseCalendarLinks(await AsyncStorage.getItem(LINKS_KEY));
    await AsyncStorage.setItem(
      LINKS_KEY,
      serializeCalendarLinks(upsertCalendarLink(links, link)),
    );
  },

  async removeLink(planId: string): Promise<void> {
    const links = parseCalendarLinks(await AsyncStorage.getItem(LINKS_KEY));
    await AsyncStorage.setItem(
      LINKS_KEY,
      serializeCalendarLinks(removeCalendarLink(links, planId)),
    );
  },

  async getDefaultCalendarId(): Promise<string | null> {
    return AsyncStorage.getItem(DEFAULT_CALENDAR_KEY);
  },

  async setDefaultCalendarId(calendarId: string): Promise<void> {
    await AsyncStorage.setItem(DEFAULT_CALENDAR_KEY, calendarId);
  },
};
