import { createContext, type ReactNode, useContext, useMemo } from "react";

import type {
  CalendarStorageRepository,
  DeviceCalendarRepository,
} from "../data/calendarRepository";

type CalendarContextValue = {
  deviceCalendarRepository: DeviceCalendarRepository;
  calendarStorageRepository: CalendarStorageRepository;
};

const CalendarContext = createContext<CalendarContextValue | null>(null);

// Repository を注入で受け取る合成ルート（adr/0003）。
export function CalendarProvider({
  deviceCalendarRepository,
  calendarStorageRepository,
  children,
}: CalendarContextValue & { children: ReactNode }) {
  const value = useMemo(
    () => ({ deviceCalendarRepository, calendarStorageRepository }),
    [deviceCalendarRepository, calendarStorageRepository],
  );
  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendarContext(): CalendarContextValue {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error(
      "useCalendarContext は CalendarProvider の内側で使ってください。",
    );
  }
  return context;
}
