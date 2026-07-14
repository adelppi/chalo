import { useQuery } from "@tanstack/react-query";

import { calendarKeys } from "../data/queryKeys";
import { useCalendarContext } from "./CalendarProvider";

/** プランの連携状態（リンクがあれば連携済み、null なら未連携） */
export function useCalendarLink(planId: string) {
  const { calendarStorageRepository } = useCalendarContext();
  return useQuery({
    queryKey: calendarKeys.link(planId),
    queryFn: () => calendarStorageRepository.getLink(planId),
  });
}
