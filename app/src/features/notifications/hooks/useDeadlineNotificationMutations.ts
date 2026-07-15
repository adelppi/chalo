import { useMutation } from "@tanstack/react-query";

import {
  buildDeadlineNotificationContent,
  computeDeadlineNotificationFireDate,
  shouldScheduleDeadlineNotification,
} from "../model/deadline";
import type { DeadlinePlanFields } from "../model/types";
import { useNotificationsContext } from "./NotificationsProvider";

// 期限通知のライフサイクル（domain/notifications.md）。予約の組み直しは
// 「旧予約を消してから、条件を満たせば予約し直す」の一本に集約する。
// 予約失敗は静かに記録し、致命としない（non-functional.md）ため、この
// mutation は決して throw しない。呼び出し側は fire-and-forget でよい。

/**
 * プランの今の状態に予約を合わせる。
 * 期限追加・期限変更・期限削除・日付が入った、のすべてをこれで賄う。
 */
export function useSyncDeadlineNotification() {
  const { deviceNotificationRepository, notificationStorageRepository } =
    useNotificationsContext();
  return useMutation({
    mutationFn: async (plan: DeadlinePlanFields): Promise<void> => {
      try {
        const link = await notificationStorageRepository.getLink(plan.id);
        if (link) {
          await deviceNotificationRepository.cancelScheduledNotification(
            link.notificationId,
          );
          await notificationStorageRepository.removeLink(plan.id);
        }
        const { deadline } = plan;
        if (
          deadline === null ||
          !shouldScheduleDeadlineNotification(plan, new Date())
        ) {
          return;
        }
        const content = buildDeadlineNotificationContent(plan);
        if (!content) {
          return;
        }
        const notificationId =
          await deviceNotificationRepository.scheduleDeadlineNotification({
            ...content,
            fireDate: computeDeadlineNotificationFireDate(deadline),
          });
        await notificationStorageRepository.saveLink({
          planId: plan.id,
          notificationId,
        });
      } catch (error) {
        console.warn("期限通知の予約を組み直せませんでした", error);
      }
    },
  });
}

/** プラン削除時：予約を消す（未予約なら何もしない） */
export function useCancelDeadlineNotification() {
  const { deviceNotificationRepository, notificationStorageRepository } =
    useNotificationsContext();
  return useMutation({
    mutationFn: async (planId: string): Promise<void> => {
      try {
        const link = await notificationStorageRepository.getLink(planId);
        if (!link) {
          return;
        }
        await deviceNotificationRepository.cancelScheduledNotification(
          link.notificationId,
        );
        await notificationStorageRepository.removeLink(planId);
      } catch (error) {
        console.warn("期限通知の予約を取り消せませんでした", error);
      }
    },
  });
}
