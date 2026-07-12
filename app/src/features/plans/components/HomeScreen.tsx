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

import { ChaloFace, PawPrint } from "@global/components/shared";
import { Chip, Icon } from "@global/components/ui";
import { palette } from "@global/constants/palette";

import { usePlans } from "../hooks/usePlans";
import { formatDateLong } from "../model/format";
import { buildHomeSections } from "../model/sections";
import type { Plan } from "../model/types";
import { PlanListRow } from "./PlanListRow";

// ホーム（C-1b 採用案：よてい一体型。空状態は C-2）。
export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: plans, isPending } = usePlans();

  const sections = useMemo(
    () => buildHomeSections(plans ?? [], new Date()),
    [plans],
  );

  const openPlan = (plan: Plan) => {
    router.push(`/plan/${plan.id}`);
  };

  const isEmpty =
    !sections.next &&
    sections.upcoming.length === 0 &&
    sections.wishes.length === 0;

  return (
    <View
      testID="home-screen"
      className="flex-1 bg-linen"
      style={{ paddingTop: insets.top + 16 }}
    >
      <View className="px-6 pb-3">
        <Text className="text-[32px] font-black leading-tight text-ink">
          プラン
        </Text>
      </View>

      {isPending ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={palette.ink} />
        </View>
      ) : isEmpty ? (
        <HomeEmptyState />
      ) : (
        <ScrollView
          className="flex-1 px-5 pt-1"
          contentContainerClassName="gap-2.5 pb-28"
          showsVerticalScrollIndicator={false}
        >
          {sections.next ? (
            <View className="overflow-hidden rounded-card shadow-hero">
              <Pressable
                testID={`plans-list-item-${sections.next.id}`}
                onPress={() => openPlan(sections.next as Plan)}
                className="relative overflow-hidden bg-ink px-5 py-[18px] active:opacity-90"
              >
                <PawPrint
                  size={104}
                  light
                  opacity={0.16}
                  rotate="-18deg"
                  style={{ position: "absolute", right: -12, bottom: -20 }}
                />
                <View className="gap-2.5">
                  <Text className="text-[11px] font-bold tracking-[1.5px] text-latte">
                    つぎの予定
                  </Text>
                  <Text className="text-[19px] font-black text-linen">
                    {sections.next.title}
                  </Text>
                  <Chip
                    icon="calendar"
                    tone="on-dark"
                    label={formatDateLong(
                      sections.next.date as string,
                      sections.next.time,
                    )}
                  />
                </View>
              </Pressable>
              {sections.upcoming.length > 0 ? (
                <View className="bg-paper">
                  {sections.upcoming.map((plan, index) => (
                    <PlanListRow
                      key={plan.id}
                      plan={plan}
                      onPress={() => openPlan(plan)}
                      showSeparator={index < sections.upcoming.length - 1}
                    />
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}

          {sections.wishes.length > 0 ? (
            <>
              <Text className="px-1.5 pt-2.5 text-xs font-bold tracking-[1.5px] text-stone">
                いつかいく
              </Text>
              <View className="overflow-hidden rounded-card bg-paper shadow-card">
                {sections.wishes.map((plan, index) => (
                  <PlanListRow
                    key={plan.id}
                    plan={plan}
                    onPress={() => openPlan(plan)}
                    showSeparator={index < sections.wishes.length - 1}
                  />
                ))}
              </View>
            </>
          ) : null}
        </ScrollView>
      )}

      <Pressable
        testID="home-create-button"
        onPress={() => router.push("/plan/new")}
        className="absolute bottom-6 right-[22px] h-[58px] w-[58px] items-center justify-center rounded-full bg-ink shadow-fab active:opacity-80"
      >
        <Icon name="plus" size={24} color={palette.linen} />
      </Pressable>
    </View>
  );
}

// C-2 ホーム空状態（足あとのチャロくん）。
function HomeEmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-10">
      <PawPrint
        size={34}
        opacity={0.18}
        rotate="30deg"
        style={{ position: "absolute", left: 70, top: 60 }}
      />
      <PawPrint
        size={34}
        opacity={0.2}
        rotate="42deg"
        style={{ position: "absolute", left: 130, top: 130 }}
      />
      <PawPrint
        size={34}
        opacity={0.22}
        rotate="60deg"
        style={{ position: "absolute", right: 120, top: 200 }}
      />
      <PawPrint
        size={34}
        opacity={0.24}
        rotate="75deg"
        style={{ position: "absolute", right: 70, top: 270 }}
      />
      <ChaloFace width={96} style={{ marginTop: 120 }} />
      <Text className="mt-[18px] text-center text-[17px] font-medium text-ink">
        まだなにもありません
      </Text>
      <Text className="mt-2 text-center text-[13px] font-medium leading-6 text-taupe">
        ＋ボタンからプランをつくろう
      </Text>
    </View>
  );
}
