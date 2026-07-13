import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { calendarKeys } from "../data/queryKeys";
import { useCalendarContext } from "./CalendarProvider";

/** 書き込めるイベント用カレンダーの一覧（権限が granted のときだけ取得） */
export function useDeviceCalendars(enabled: boolean) {
  const { deviceCalendarRepository } = useCalendarContext();
  return useQuery({
    queryKey: calendarKeys.calendars,
    queryFn: () => deviceCalendarRepository.listCalendars(),
    enabled,
  });
}

/** 設定画面で選んだ既定カレンダーの id（未選択なら null） */
export function useDefaultCalendarId() {
  const { calendarStorageRepository } = useCalendarContext();
  return useQuery({
    queryKey: calendarKeys.defaultCalendar,
    queryFn: () => calendarStorageRepository.getDefaultCalendarId(),
  });
}

/** 端末のデフォルトカレンダーの id（未選択時のフォールバック先の表示に使う） */
export function useSystemDefaultCalendarId(enabled: boolean) {
  const { deviceCalendarRepository } = useCalendarContext();
  return useQuery({
    queryKey: calendarKeys.systemDefaultCalendar,
    queryFn: () => deviceCalendarRepository.getSystemDefaultCalendarId(),
    enabled,
  });
}

export function useSetDefaultCalendar() {
  const { calendarStorageRepository } = useCalendarContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (calendarId: string) =>
      calendarStorageRepository.setDefaultCalendarId(calendarId),
    onSuccess: (_, calendarId) => {
      queryClient.setQueryData(calendarKeys.defaultCalendar, calendarId);
    },
  });
}
