import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChaloFace, PawPrint } from "@global/components/shared";
import { Avatar, Button } from "@global/components/ui";

import { usePairState } from "../hooks/usePairState";

// ペア成立（B-5）。
export function PairSuccessScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: pairState } = usePairState();

  const names =
    pairState?.status === "paired"
      ? { mine: pairState.myName, partner: pairState.partnerName }
      : null;

  return (
    <View
      testID="pairing-success-screen"
      className="flex-1 items-center justify-center bg-linen px-8"
    >
      <PawPrint
        size={36}
        opacity={0.14}
        rotate="24deg"
        style={{ position: "absolute", left: 46, top: 150 }}
      />
      <PawPrint
        size={36}
        opacity={0.14}
        rotate="-20deg"
        style={{ position: "absolute", right: 60, top: 210 }}
      />

      <ChaloFace width={128} />
      <Text className="mt-[22px] text-center font-zen-black text-[28px] text-ink">
        つながりました！
      </Text>

      {names ? (
        <View className="mt-[22px] flex-row items-center gap-3">
          <View className="flex-row items-center gap-2 rounded-full bg-paper px-4 py-2 shadow-card">
            <Avatar initial={names.mine.charAt(0)} size={26} />
            <Text className="font-zen-bold text-sm text-ink">{names.mine}</Text>
          </View>
          <View className="flex-row items-center gap-2 rounded-full bg-paper px-4 py-2 shadow-card">
            <Avatar initial={names.partner.charAt(0)} tone="plum" size={26} />
            <Text className="font-zen-bold text-sm text-ink">
              {names.partner}
            </Text>
          </View>
        </View>
      ) : null}

      <View
        className="absolute left-6 right-6"
        style={{ bottom: insets.bottom + 24 }}
      >
        <Button
          testID="pairing-success-start-button"
          label="はじめよう！"
          onPress={() => router.replace("/pairing/notifications")}
        />
      </View>
    </View>
  );
}
