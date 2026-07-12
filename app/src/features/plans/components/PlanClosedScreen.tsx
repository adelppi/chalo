import { useRouter } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChaloFace, PawPrint } from "@global/components/shared";
import { Button } from "@global/components/ui";
import { palette } from "@global/constants/palette";

import { usePlan } from "../hooks/usePlan";

type PlanClosedScreenProps = {
  id: string;
};

// おしまい完了のお祝い（D-3）。おしまいにした直後に全画面で出す。
export function PlanClosedScreen({ id }: PlanClosedScreenProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: plan, isPending } = usePlan(id);

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
          <Text className="mt-[22px] text-center font-zen-black text-[28px] text-linen">
            おつかれさま！
          </Text>
          {plan ? (
            <View className="mt-4 rounded-full bg-linen/[0.12] px-[18px] py-2">
              <Text className="font-zen-bold text-sm text-linen">
                {plan.title}
              </Text>
            </View>
          ) : null}
          <Text className="mt-3.5 font-zen-medium text-[13px] text-latte">
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
