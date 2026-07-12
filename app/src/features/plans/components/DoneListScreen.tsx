import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PawPrint } from "@global/components/shared";
import { palette } from "@global/constants/palette";

import { usePlans } from "../hooks/usePlans";
import { formatClosedLabel } from "../model/format";
import { groupDoneByMonth } from "../model/sections";
import { deriveClosedDate } from "../model/status";

// おしまい一覧（D-4。空状態は D-5）。月ごとにグループ化して新しい順に並べる。
export function DoneListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: plans, isPending } = usePlans();

  const groups = useMemo(
    () => groupDoneByMonth(plans ?? [], new Date()),
    [plans],
  );

  return (
    <View
      testID="done-screen"
      className="flex-1 bg-linen"
      style={{ paddingTop: insets.top + 16 }}
    >
      <View className="px-6 pb-3">
        <Text className="font-zen-black text-[32px] leading-tight text-ink">
          おしまいプラン
        </Text>
      </View>

      {isPending ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={palette.ink} />
        </View>
      ) : groups.length === 0 ? (
        <DoneEmptyState />
      ) : (
        <ScrollView
          className="flex-1 px-5 pt-1"
          contentContainerClassName="gap-2.5 pb-10"
          showsVerticalScrollIndicator={false}
        >
          {groups.map((group) => (
            <View key={group.label} className="gap-2.5">
              <Text className="px-1.5 pt-1.5 font-zen-bold text-xs tracking-[1.5px] text-stone">
                {group.label}
              </Text>
              <View className="overflow-hidden rounded-[20px] bg-paper shadow-card">
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
                        className="font-zen-bold text-[17px] text-ink"
                        numberOfLines={1}
                      >
                        {plan.title}
                      </Text>
                      <Text className="font-zen text-[11.5px] text-stone">
                        {formatClosedLabel(deriveClosedDate(plan) as string)}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
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
      <Text className="text-center font-zen-bold text-[17px] text-ink">
        まだ「おしまい」はありません
      </Text>
      <Text className="mt-2 text-center font-zen-medium text-[13px] leading-6 text-taupe">
        やりたいことが終わったら、ここに並びます。
      </Text>
    </View>
  );
}
