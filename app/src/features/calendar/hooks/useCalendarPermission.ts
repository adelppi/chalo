import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { log } from "@global/lib/logging";

import { calendarKeys } from "../data/queryKeys";
import type { CalendarPermission } from "../model/types";
import { useCalendarContext } from "./CalendarProvider";

/** カレンダー権限の現在値（granted / denied / undetermined） */
export function useCalendarPermission() {
  const { deviceCalendarRepository } = useCalendarContext();
  return useQuery({
    queryKey: calendarKeys.permission,
    queryFn: () => deviceCalendarRepository.getPermission(),
  });
}

/**
 * OS の許可ダイアログを出す（JIT。domain/onboarding.md）。
 * iOS の仕様で実ダイアログを出せるのは実質1回。以降は iOS 設定へ誘導する。
 */
export function useRequestCalendarPermission() {
  const { deviceCalendarRepository } = useCalendarContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deviceCalendarRepository.requestPermission(),
    onSuccess: (permission: CalendarPermission) => {
      // 権限要求の結果を記録する（features.md 11.4）
      log("info", "calendar_permission_result", { detail: permission });
      queryClient.setQueryData(calendarKeys.permission, permission);
      // 許可されるとカレンダー一覧・端末デフォルトが読めるようになる
      queryClient.invalidateQueries({ queryKey: calendarKeys.calendars });
      queryClient.invalidateQueries({
        queryKey: calendarKeys.systemDefaultCalendar,
      });
    },
  });
}
