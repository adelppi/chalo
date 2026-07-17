import { useMutation, useQueryClient } from "@tanstack/react-query";

import { log } from "@global/lib/logging";

import { calendarKeys } from "../data/queryKeys";
import { buildCalendarEvent } from "../model/event";
import type { CalendarLink, CalendarPlanFields } from "../model/types";
import { useCalendarContext } from "./CalendarProvider";

// 追加・削除・自動更新の mutation フック（domain/calendar.md）。
// 権限の確認・プライミングは呼び出し側（コンポーネント）が済ませてから呼ぶ。

/** 「カレンダーに追加」：イベントを作成してリンクを保存する */
export function useAddPlanToCalendar() {
  const { deviceCalendarRepository, calendarStorageRepository } =
    useCalendarContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (plan: CalendarPlanFields): Promise<CalendarLink> => {
      const event = buildCalendarEvent(plan);
      if (!event) {
        throw new Error("日付のないプランはカレンダーに追加できません");
      }
      // 追加先：設定画面で選んだ既定カレンダー。未選択時は端末のデフォルトへ
      // フォールバックする（domain/calendar.md）
      const calendarId =
        (await calendarStorageRepository.getDefaultCalendarId()) ??
        (await deviceCalendarRepository.getSystemDefaultCalendarId());
      if (!calendarId) {
        throw new Error("追加先のカレンダーが見つかりません");
      }
      const eventId = await deviceCalendarRepository.createEvent(
        calendarId,
        event,
      );
      const link: CalendarLink = { planId: plan.id, eventId, calendarId };
      await calendarStorageRepository.saveLink(link);
      return link;
    },
    onSuccess: (link) => {
      log("info", "calendar_event_added", { ids: { planId: link.planId } });
      queryClient.setQueryData(calendarKeys.link(link.planId), link);
    },
  });
}

/**
 * 「カレンダーから削除」とプラン削除時の自動削除。
 * 外部で手動削除済みならイベントは触らず、リンクだけ解除する（domain/calendar.md）。
 */
export function useRemovePlanFromCalendar() {
  const { deviceCalendarRepository, calendarStorageRepository } =
    useCalendarContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (planId: string): Promise<void> => {
      const link = await calendarStorageRepository.getLink(planId);
      if (!link) {
        return;
      }
      if (await deviceCalendarRepository.eventExists(link.eventId)) {
        await deviceCalendarRepository.deleteEvent(link.eventId);
      }
      await calendarStorageRepository.removeLink(planId);
    },
    onSuccess: (_, planId) => {
      log("info", "calendar_event_removed", { ids: { planId } });
      queryClient.setQueryData(calendarKeys.link(planId), null);
    },
  });
}

export type CalendarSyncResult =
  /** イベントを更新した */
  | "updated"
  /** リンクを解除して未連携に戻した（外部で削除済み・日付が外された） */
  | "unlinked"
  /** 未連携のプランだったので何もしていない */
  | "none";

/**
 * 連携済みプランの編集後にイベントを自動更新する（置いてけぼり防止）。
 * 外部で手動削除されていたらリンクを解除して「未連携」に戻す。
 * 日付が外されたらイベントを維持できないため、削除してリンクを解除する。
 */
export function useSyncPlanToCalendar() {
  const { deviceCalendarRepository, calendarStorageRepository } =
    useCalendarContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      plan: CalendarPlanFields,
    ): Promise<CalendarSyncResult> => {
      const link = await calendarStorageRepository.getLink(plan.id);
      if (!link) {
        return "none";
      }
      if (!(await deviceCalendarRepository.eventExists(link.eventId))) {
        await calendarStorageRepository.removeLink(plan.id);
        return "unlinked";
      }
      const event = buildCalendarEvent(plan);
      if (!event) {
        await deviceCalendarRepository.deleteEvent(link.eventId);
        await calendarStorageRepository.removeLink(plan.id);
        return "unlinked";
      }
      await deviceCalendarRepository.updateEvent(link.eventId, event);
      return "updated";
    },
    onSuccess: (result, plan) => {
      if (result !== "none") {
        log("info", "calendar_event_synced", {
          ids: { planId: plan.id },
          detail: result,
        });
      }
      queryClient.invalidateQueries({ queryKey: calendarKeys.link(plan.id) });
    },
  });
}
