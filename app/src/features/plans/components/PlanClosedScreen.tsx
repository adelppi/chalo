import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChaloFace, PawPrint } from "@global/components/shared";
import { Button } from "@global/components/ui";
import { palette } from "@global/constants/palette";

import { usePlan } from "../hooks/usePlan";
import { pickClosedGreeting } from "../model/greeting";

type PlanClosedScreenProps = {
  id: string;
};

// おしまい完了のお祝い（D-3）。おしまいにした直後に全画面で出す。
export function PlanClosedScreen({ id }: PlanClosedScreenProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: plan, isPending } = usePlan(id);
  // 手動・自動どちらのおしまいでも、開くたびに挨拶をランダムに選ぶ（Issue #16）。
  // マウント時に一度だけ確定させたいので useState の遅延初期化で持つ。
  const [greeting] = useState(() => pickClosedGreeting(Math.random()));

  return (
    <View
      testID="plan-closed-screen"
      className="flex-1 items-center justify-center bg-ink px-8"
    >
      <PawPrint
        size={40}
        light
        opacity={0.12}
        rotate="24deg"
        style={{ position: "absolute", left: 40, top: 130 }}
      />
      <PawPrint
        size={40}
        light
        opacity={0.12}
        rotate="-24deg"
        style={{ position: "absolute", right: 56, top: 190 }}
      />
      <PawPrint
        size={40}
        light
        opacity={0.1}
        rotate="50deg"
        style={{ position: "absolute", left: 80, bottom: 190 }}
      />

      {isPending ? (
        <ActivityIndicator color={palette.linen} />
      ) : (
        <>
          <ChaloFace width={132} />
          <Text className="mt-[22px] text-center text-[28px] font-black text-linen">
            {greeting}
          </Text>
          {plan ? (
            <View className="mt-4 rounded-full bg-linen/[0.12] px-[18px] py-2">
              <Text className="text-sm font-bold text-linen">{plan.title}</Text>
            </View>
          ) : null}
          <Text className="mt-3.5 text-[13px] font-medium text-latte">
            プランが終了しました！
          </Text>
        </>
      )}

      <View
        className="absolute left-6 right-6"
        style={{ bottom: insets.bottom + 24 }}
      >
        <Button
          testID="plan-closed-done-button"
          label="とじる"
          variant="cream"
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
}
