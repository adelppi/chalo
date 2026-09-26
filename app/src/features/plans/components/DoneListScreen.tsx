import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { PawPrint } from "@global/components/shared";
import { palette } from "@global/constants/palette";

import { usePlans } from "../hooks/usePlans";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { formatClosedLabel } from "../model/format";
import { groupDoneByMonth } from "../model/sections";
import { deriveClosedDate } from "../model/status";

// おわったプラン（D-4。空状態は D-5）。月ごとにグループ化して新しい順に並べる。
export function DoneListScreen() {
  const router = useRouter();
  const { data: plans, isPending, refetch } = usePlans();
  const { refreshing, onRefresh } = usePullToRefresh(refetch);

  const groups = useMemo(
    () => groupDoneByMonth(plans ?? [], new Date()),
    [plans],
  );

  // 見出しは純正の大タイトル（(tabs)/(done)/_layout.tsx）。ホームと同じく、
  // ScrollView を常に画面ルートの最初の子に置き、中身だけを切り替える。ルートは
  // collapsable={false}（Issue #107）。
  // 空状態でも引っ張って再取得できるようスクロール可能にする（相手の追加を拾う）。
  const isEmpty = groups.length === 0;

  return (
    <View testID="done-screen" collapsable={false} className="flex-1 bg-linen">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1"
        contentContainerClassName={
          isPending
            ? "grow items-center justify-center"
            : isEmpty
              ? "grow"
              : "grow gap-2.5 px-5 pt-1 pb-10"
        }
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical
        refreshControl={
          isPending ? undefined : (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={palette.ink}
            />
          )
        }
      >
        {isPending ? (
          <ActivityIndicator color={palette.ink} />
        ) : isEmpty ? (
          <DoneEmptyState />
        ) : (
          groups.map((group) => (
            <View key={group.label} className="gap-2.5">
              <Text className="px-1.5 pt-1.5 text-xs font-bold tracking-[1.5px] text-stone">
                {group.label}
              </Text>
              <View className="overflow-hidden rounded-card bg-paper shadow-card">
                {group.plans.map((plan, index) => (
                  <Pressable
                    key={plan.id}
                    testID={`done-list-item-${plan.id}`}
                    onPress={() => router.push(`/plan/${plan.id}`)}
                    className={`flex-row items-center gap-3 px-[18px] py-4 active:opacity-70 ${
                      index < group.plans.length - 1
                        ? "border-b border-sand"
                        : ""
                    }`}
                  >
                    <PawPrint size={22} opacity={0.55} />
                    <View className="flex-1 gap-0.5">
                      <Text
                        className="text-[17px] font-medium text-ink"
                        numberOfLines={1}
                      >
                        {plan.title}
                      </Text>
                      <Text className="text-[11.5px] font-normal text-stone">
                        {formatClosedLabel(deriveClosedDate(plan) as string)}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// D-5 おしまい空状態。
function DoneEmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-10">
      <PawPrint
        size={32}
        opacity={0.16}
        rotate="28deg"
        style={{ position: "absolute", left: 90, top: 100 }}
      />
      <PawPrint
        size={32}
        opacity={0.18}
        rotate="-32deg"
        style={{ position: "absolute", right: 100, top: 170 }}
      />
      <Text className="text-center text-[17px] font-medium text-ink">
        まだおわったプランはありません
      </Text>
      <Text className="mt-2 text-center text-[13px] font-medium leading-6 text-taupe">
        やりたいことが終わったら、ここに並びます。
      </Text>
    </View>
  );
}
