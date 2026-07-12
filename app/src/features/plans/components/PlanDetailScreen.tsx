import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PawPrint } from "@global/components/shared";
import { Avatar, Button, Chip, Dialog, Icon } from "@global/components/ui";
import { palette } from "@global/constants/palette";
import { useToastStore } from "@global/store/useToastStore";

import { usePlan } from "../hooks/usePlan";
import { useClosePlan, useDeletePlan } from "../hooks/usePlanMutations";
import { formatCreatedByLabel, formatDateLong } from "../model/format";
import type { Plan } from "../model/types";

type PlanDetailScreenProps = {
  id: string;
};

// プラン詳細（D-1）。相手が編集中なら F-9、見つからなければ F-10 を出す。
export function PlanDetailScreen({ id }: PlanDetailScreenProps) {
  const { data: plan, isPending } = usePlan(id);

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

  if (plan.lockedByName) {
    return <PlanLocked plan={plan} />;
  }

  return <PlanDetail plan={plan} />;
}

function todayString(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${mm}-${dd}`;
}

function PlanDetail({ plan }: { plan: Plan }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const showToast = useToastStore((state) => state.show);
  const deletePlan = useDeletePlan(plan.id);
  const closePlan = useClosePlan(plan.id);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [calendarDialogVisible, setCalendarDialogVisible] = useState(false);

  const displayUrl = plan.referenceUrl?.replace(/^https?:\/\//, "");

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
      {/* 編集・削除はナビゲーションヘッダーに統合（Issue #16）。戻るはネイティブの戻る。 */}
      <Stack.Screen
        options={{
          headerRight: () => (
            <View className="flex-row items-center gap-1">
              <Pressable
                testID="plan-detail-edit-button"
                hitSlop={8}
                onPress={() => router.push(`/plan/${plan.id}/edit`)}
                className="p-1.5 active:opacity-60"
              >
                <Icon name="pencil" size={19} color={palette.ink} />
              </Pressable>
              <Pressable
                testID="plan-detail-delete-button"
                hitSlop={8}
                onPress={() => setDeleteDialogVisible(true)}
                className="p-1.5 active:opacity-60"
              >
                <Icon name="trash" size={19} color={palette.rust} />
              </Pressable>
            </View>
          ),
        }}
      />

      <PawPrint
        size={130}
        opacity={0.06}
        rotate="-16deg"
        style={{ position: "absolute", right: -26, top: 40 }}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3.5 px-7 pt-3">
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
            <View className="h-[34px] w-[34px] items-center justify-center rounded-card bg-blush">
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
    </View>
  );
}

// F-9 編集ロック中の競合（相手が編集しているとき）。
function PlanLocked({ plan }: { plan: Plan }) {
  const insets = useSafeAreaInsets();

  return (
    <View testID="plan-locked-screen" className="flex-1 bg-linen">
      <View className="px-7 pt-3">
        <Text className="text-2xl font-black leading-9 text-ink">
          {plan.title}
        </Text>
      </View>

      <View className="mx-6 mt-4 flex-row items-start gap-[11px] rounded-card border border-honey-border bg-honey-surface px-4 py-[15px]">
        <Icon name="lock" size={20} color={palette.honey.DEFAULT} />
        <View className="flex-1 gap-[3px]">
          <Text className="text-sm font-medium text-honey-text">
            {plan.lockedByName} が編集しています
          </Text>
          <Text className="text-xs font-medium leading-5 text-honey-soft">
            すこし待ってから、もう一度プランを開いてください。
          </Text>
        </View>
      </View>

      <View className="mx-6 mt-3.5 overflow-hidden rounded-card bg-paper opacity-60 shadow-card">
        {plan.date ? (
          <View className="flex-row items-center justify-between border-b border-sand px-[18px] py-[15px]">
            <Text className="text-xs font-bold tracking-[1px] text-stone">
              日にち
            </Text>
            <Text className="text-[15px] font-medium text-ink">
              {formatDateLong(plan.date, plan.time)}
            </Text>
          </View>
        ) : null}
        {plan.memo ? (
          <View className="gap-[5px] px-[18px] py-[15px]">
            <Text className="text-xs font-bold tracking-[1px] text-stone">
              メモ
            </Text>
            <Text className="text-sm font-medium leading-6 text-ink">
              {plan.memo}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="flex-1" />

      <View className="px-6" style={{ paddingBottom: insets.bottom + 24 }}>
        <View className="h-[54px] flex-row items-center justify-center gap-2 rounded-card bg-honey-muted">
          <Icon name="lock" size={16} color={palette.stone} />
          <Text className="text-base font-medium text-stone">
            編集できません
          </Text>
        </View>
      </View>
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
