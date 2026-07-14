import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  PlanCalendarButton,
  useRemovePlanFromCalendar,
} from "@features/calendar";
import { useCancelDeadlineNotification } from "@features/notifications";
import { PawPrint } from "@global/components/shared";
import { Avatar, Button, Chip, Dialog, Icon } from "@global/components/ui";
import { palette } from "@global/constants/palette";
import { useAuthStore } from "@global/store/useAuthStore";
import { useToastStore } from "@global/store/useToastStore";
import { backHeaderOptions, iconHeaderItem } from "@global/utils/headerItems";

import { usePlan } from "../hooks/usePlan";
import { useClosePlan, useDeletePlan } from "../hooks/usePlanMutations";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { useStartEditing } from "../hooks/useStartEditing";
import { evaluateEditLock } from "../model/editLock";
import { formatCreatedByLabel, formatDateLong } from "../model/format";
import type { Plan } from "../model/types";
import { PlanLockedScreen } from "./PlanLockedScreen";

type PlanDetailScreenProps = {
  id: string;
};

// プラン詳細（D-1）。開いた時点でその1件を最新取得（adr/0004）し、相手がロック中
// （TTL 内）なら編集ロック画面（F-9）に切り替えて操作をブロックする（adr/0005）。
// 見つからなければ F-10 を出す。
export function PlanDetailScreen({ id }: PlanDetailScreenProps) {
  const { data: plan, isPending, refetch } = usePlan(id);
  const userId = useAuthStore((state) => state.userId);

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-linen">
        <ActivityIndicator color={palette.ink} />
      </View>
    );
  }

  if (!plan) {
    return <PlanNotFound />;
  }

  const lockedByPartner =
    userId != null &&
    evaluateEditLock({
      lockedBy: plan.lockedBy,
      lockedAt: plan.lockedAt,
      userId,
      now: new Date(),
    }) === "partner";
  if (lockedByPartner) {
    return <PlanLockedScreen plan={plan} />;
  }

  return <PlanDetail plan={plan} refetch={refetch} />;
}

function todayString(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${mm}-${dd}`;
}

function PlanDetail({
  plan,
  refetch,
}: {
  plan: Plan;
  refetch: () => Promise<unknown>;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const showToast = useToastStore((state) => state.show);
  const { refreshing, onRefresh } = usePullToRefresh(refetch);
  const deletePlan = useDeletePlan(plan.id);
  const closePlan = useClosePlan(plan.id);
  const startEditing = useStartEditing(plan.id);
  const removeFromCalendar = useRemovePlanFromCalendar();
  const cancelDeadlineNotification = useCancelDeadlineNotification();
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const displayUrl = plan.referenceUrl?.replace(/^https?:\/\//, "");

  // 詳細を開いた後に相手がロックを取ることもあるため、編集ボタン押下時にも
  // その1件だけ最新取得してロック判定する（adr/0005）。空いていればロックを立てて
  // 編集画面へ。相手ロック中・削除済みはキャッシュ更新でこの画面が F-9 / F-10 に切り替わる。
  const handleEdit = () => {
    startEditing.mutate(undefined, {
      onSuccess: (result) => {
        if (result.type === "acquired") {
          router.push(`/plan/${plan.id}/edit`);
        }
      },
      onError: () => {
        showToast("編集を開始できませんでした。もう一度お試しください。", {
          variant: "error",
        });
      },
    });
  };

  const handleDelete = () => {
    deletePlan.mutate(undefined, {
      onSuccess: () => {
        // プラン削除に連動して端末カレンダーのイベントも自動削除する
        // （domain/calendar.md。未連携なら何もしない。失敗しても削除自体は完了している）
        removeFromCalendar.mutate(plan.id);
        // 期限通知の予約も取り消す（domain/notifications.md。未予約なら何もしない）
        cancelDeadlineNotification.mutate(plan.id);
        setDeleteDialogVisible(false);
        showToast("削除しました", { icon: "trash" });
        router.back();
      },
      onError: () => {
        setDeleteDialogVisible(false);
        showToast("保存できませんでした。操作をやりなおしてください。", {
          variant: "error",
        });
      },
    });
  };

  const handleClose = () => {
    closePlan.mutate(todayString(), {
      onSuccess: () => {
        // 手動おしまいに連動して期限通知の予約も取り消す
        // （domain/notifications.md。未予約なら何もしない）
        cancelDeadlineNotification.mutate(plan.id);
        router.replace(`/plan/${plan.id}/closed`);
      },
      onError: () => {
        showToast("保存できませんでした。操作をやりなおしてください。", {
          variant: "error",
        });
      },
    });
  };

  return (
    <View testID="plan-detail-screen" className="flex-1 bg-linen">
      <PawPrint
        size={130}
        opacity={0.06}
        rotate="-16deg"
        style={{ position: "absolute", right: -26, top: 96 }}
      />

      {/* D-1：戻る・編集・削除はネイティブヘッダーのバーボタンで描く。
          編集・削除は sharesBackground: false で個別の背景にし、
          iOS 26 の Liquid Glass でも1つのカプセルに融合しないようにする。 */}
      <Stack.Screen
        options={backHeaderOptions({
          onBack: () => router.back(),
          right: [
            iconHeaderItem({
              symbol: "pencil",
              onPress: handleEdit,
              accessibilityLabel: "編集",
              disabled: startEditing.isPending,
            }),
            iconHeaderItem({
              symbol: "trash",
              onPress: () => setDeleteDialogVisible(true),
              accessibilityLabel: "削除",
              tintColor: palette.rust,
            }),
          ],
        })}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="grow pb-6"
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={palette.ink}
          />
        }
      >
        <View className="gap-3.5 px-7 pt-6">
          <Text className="text-[28px] font-black leading-10 text-ink">
            {plan.title}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {plan.date ? (
              <Chip
                icon="calendar"
                size="md"
                label={formatDateLong(plan.date, plan.time)}
              />
            ) : null}
            {plan.placeName ? (
              <Chip icon="pin" tone="blush" size="md" label={plan.placeName} />
            ) : null}
          </View>
        </View>

        {plan.memo ? (
          <View className="mx-6 mt-[22px] gap-2 rounded-card bg-paper p-[18px] shadow-card">
            <Text className="text-[11px] font-bold tracking-[1.5px] text-stone">
              メモ
            </Text>
            <Text className="text-sm font-medium leading-7 text-ink">
              {plan.memo}
            </Text>
          </View>
        ) : null}

        {plan.referenceUrl ? (
          <Pressable
            testID="plan-detail-url-button"
            onPress={() => Linking.openURL(plan.referenceUrl as string)}
            className="mx-6 mt-3 flex-row items-center gap-[11px] rounded-card bg-paper px-4 py-3.5 shadow-card active:opacity-70"
          >
            <View className="h-[34px] w-[34px] items-center justify-center rounded-chip bg-blush">
              <Icon name="camera" size={18} color={palette.plum} />
            </View>
            <View className="min-w-0 flex-1 gap-px">
              <Text className="text-[11px] font-bold tracking-[1px] text-stone">
                参考URL
              </Text>
              <Text
                className="text-[13px] font-medium text-plum"
                numberOfLines={1}
              >
                {displayUrl}
              </Text>
            </View>
            <Icon name="external" size={12} color={palette.stone} />
          </Pressable>
        ) : null}

        <View className="mx-6 mt-3 flex-row items-center gap-2 px-1">
          <Avatar initial={plan.ownerName.charAt(0)} />
          <Text className="text-xs font-medium text-stone">
            {formatCreatedByLabel(plan.ownerName, plan.createdAt)}
          </Text>
        </View>
      </ScrollView>

      <View
        className="gap-3 px-6"
        style={{ paddingBottom: insets.bottom + 24 }}
      >
        <PlanCalendarButton plan={plan} />
        <Button
          testID="plan-detail-close-button"
          label="おしまいにする"
          icon="check-circle"
          iconSize={18}
          variant="accent"
          size="lg"
          onPress={handleClose}
          disabled={closePlan.isPending}
        />
      </View>

      {/* F-1 削除ダイアログ */}
      <Dialog
        visible={deleteDialogVisible}
        title="このプランを削除しますか？"
        message={`「${plan.title}」は、ふたりの一覧から消えます。この操作はもとに戻せません。`}
        onCancel={() => setDeleteDialogVisible(false)}
        cancelTestID="plan-detail-delete-cancel-button"
        confirm={{
          label: "削除する",
          variant: "destructive",
          onPress: handleDelete,
          testID: "plan-detail-delete-confirm-button",
        }}
      />
    </View>
  );
}

// F-10 プランが見つからない（削除済みプランへの遷移）。
function PlanNotFound() {
  const router = useRouter();

  const goBackToList = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  return (
    <View testID="plan-not-found-screen" className="flex-1 bg-linen">
      <Stack.Screen options={backHeaderOptions({ onBack: goBackToList })} />
      <View className="flex-1 items-center justify-center px-11">
        <PawPrint size={56} opacity={0.25} rotate="-14deg" />
        <Text className="mt-5 text-center text-lg font-black text-ink">
          プランが見つかりません
        </Text>
        <Text className="mt-2.5 text-center text-[13px] font-medium leading-6 text-taupe">
          このプランは削除されたようです。
        </Text>
        <View className="mt-[22px]">
          <Button
            testID="plan-not-found-back-button"
            label="一覧にもどる"
            size="sm"
            onPress={goBackToList}
            className="px-7"
          />
        </View>
      </View>
    </View>
  );
}
