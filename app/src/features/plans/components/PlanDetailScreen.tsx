import { useRouter } from "expo-router";
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

import { PawPrint } from "@global/components/shared";
import {
  Avatar,
  BackHeader,
  Button,
  Chip,
  Dialog,
  Icon,
} from "@global/components/ui";
import { palette } from "@global/constants/palette";
import { useToastStore } from "@global/store/useToastStore";

import { usePlan } from "../hooks/usePlan";
import { useClosePlan, useDeletePlan } from "../hooks/usePlanMutations";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { useStartEditing } from "../hooks/useStartEditing";
import { formatCreatedByLabel, formatDateLong } from "../model/format";
import type { Plan } from "../model/types";

type PlanDetailScreenProps = {
  id: string;
};

// プラン詳細（D-1）。相手がロック中でも閲覧は可能で、編集ボタン押下時にだけ
// ロック判定する（adr/0005）。見つからなければ F-10 を出す。
export function PlanDetailScreen({ id }: PlanDetailScreenProps) {
  const { data: plan, isPending, refetch } = usePlan(id);

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
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [calendarDialogVisible, setCalendarDialogVisible] = useState(false);
  // 相手が編集中だったとき F-9 のダイアログに出す表示名（null なら非表示）
  const [lockOwnerName, setLockOwnerName] = useState<string | null>(null);

  const displayUrl = plan.referenceUrl?.replace(/^https?:\/\//, "");

  // 編集ボタン押下時にその1件だけ最新取得し、空いていればロックを立ててから
  // 編集画面を開く（adr/0005）。not-found はキャッシュが null になり F-10 へ切り替わる。
  const handleEdit = () => {
    startEditing.mutate(undefined, {
      onSuccess: (result) => {
        if (result.type === "acquired") {
          router.push(`/plan/${plan.id}/edit`);
        } else if (result.type === "locked") {
          setLockOwnerName(result.lockedByName);
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

      {/* D-1：戻る・編集・削除は画面内の透明な円形ボタンで描く。
          編集と削除は 44px のタップ領域を 10px 空けて並べる（くっつけない）。 */}
      <BackHeader
        testID="plan-detail-back-button"
        right={
          <View className="flex-row items-center gap-2.5">
            <Pressable
              testID="plan-detail-edit-button"
              onPress={handleEdit}
              disabled={startEditing.isPending}
              className="h-11 w-11 items-center justify-center rounded-full active:opacity-60"
            >
              <Icon name="pencil" size={20} color={palette.ink} />
            </Pressable>
            <Pressable
              testID="plan-detail-delete-button"
              onPress={() => setDeleteDialogVisible(true)}
              className="h-11 w-11 items-center justify-center rounded-full active:opacity-60"
            >
              <Icon name="trash" size={20} color={palette.rust} />
            </Pressable>
          </View>
        }
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
        <Button
          testID="plan-detail-calendar-button"
          label="カレンダーに追加"
          icon="calendar-plus"
          variant="outline"
          onPress={() => setCalendarDialogVisible(true)}
        />
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

      {/* F-4 カレンダー許可のプライミング（モックのため連携はトースト表示のみ） */}
      <Dialog
        visible={calendarDialogVisible}
        title="カレンダーと連携しますか？"
        message="日時が設定されているプランを、端末のカレンダーに追加できます。次の画面で許可してください。"
        cancelLabel="あとで"
        onCancel={() => setCalendarDialogVisible(false)}
        confirm={{
          label: "連携する",
          onPress: () => {
            setCalendarDialogVisible(false);
            showToast("カレンダーに追加しました", { icon: "calendar" });
          },
          testID: "plan-detail-calendar-confirm-button",
        }}
      />

      {/* F-9 編集ロック衝突。「〇〇が編集中です」（non-functional.md） */}
      <Dialog
        testID="plan-detail-locked-dialog"
        visible={lockOwnerName !== null}
        title={`${lockOwnerName ?? ""}が編集中です`}
        message="すこし待ってから、もう一度お試しください。"
        cancelLabel="わかりました"
        onCancel={() => setLockOwnerName(null)}
        cancelTestID="plan-detail-locked-close-button"
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
      <BackHeader testID="plan-not-found-back-button" onBack={goBackToList} />
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
