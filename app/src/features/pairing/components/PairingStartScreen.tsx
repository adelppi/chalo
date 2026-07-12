import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PawPrint } from "@global/components/shared";
import { Icon } from "@global/components/ui";
import { palette } from "@global/constants/palette";

// ペアをはじめる（B-1）。
export function PairingStartScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      testID="pairing-start-screen"
      className="flex-1 bg-linen"
      style={{ paddingTop: insets.top + 40 }}
    >
      <PawPrint
        size={130}
        opacity={0.07}
        rotate="-16deg"
        style={{ position: "absolute", right: -24, top: 120 }}
      />

      <View className="gap-2.5 px-7">
        <Text className="text-[26px] font-black text-ink">つながろう</Text>
        <Text className="text-[13px] font-medium leading-6 text-taupe">
          chalo
          はふたりでつかうアプリです。相手を招待するか、もらったコードで参加しましょう。
        </Text>
      </View>

      <View className="gap-3.5 px-6 pt-8">
        <Pressable
          testID="pairing-start-invite-button"
          onPress={() => router.push("/pairing/invite")}
          className="flex-row items-center gap-4 rounded-card bg-ink p-[22px] shadow-hero active:opacity-90"
        >
          <View className="h-12 w-12 items-center justify-center rounded-full bg-linen/[0.14]">
            <Icon name="tray-up" size={22} color={palette.linen} />
          </View>
          <View className="flex-1 gap-[3px]">
            <Text className="text-[17px] font-semibold text-linen">
              招待コードをつくる
            </Text>
            <Text className="text-xs font-medium text-latte">
              相手に送って、まってましょう
            </Text>
          </View>
          <Icon name="chevron-right" size={14} color={palette.latte} />
        </Pressable>

        <Pressable
          testID="pairing-start-enter-code-button"
          onPress={() => router.push("/pairing/code")}
          className="flex-row items-center gap-4 rounded-card bg-paper p-[22px] shadow-card active:opacity-70"
        >
          <View className="h-12 w-12 items-center justify-center rounded-full bg-blush">
            <Icon name="keypad" size={22} color={palette.plum} />
          </View>
          <View className="flex-1 gap-[3px]">
            <Text className="text-[17px] font-medium text-ink">
              コードをもっています
            </Text>
            <Text className="text-xs font-medium text-stone">
              もらったコードを入力します
            </Text>
          </View>
          <Icon name="chevron-right" size={14} color={palette.latte} />
        </Pressable>

        <View className="mt-1.5 items-center">
          <Pressable
            testID="pairing-start-solo-button"
            onPress={() => router.back()}
            hitSlop={8}
            className="border-b-[1.5px] border-ink/30 pb-0.5"
          >
            <Text className="text-sm font-medium text-taupe">
              ひとりではじめる
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
