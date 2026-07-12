import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChaloFace } from "@global/components/shared";
import { Button, Icon } from "@global/components/ui";
import { palette } from "@global/constants/palette";

import { usePairState } from "../hooks/usePairState";

// 通知プライミング（B-6。ペア成立直後の JIT）。
// モック段階のため、どちらのボタンも実際の通知許可は要求せずに閉じるだけ。
export function NotificationPrimingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: pairState } = usePairState();

  const partnerName =
    pairState?.status === "paired" ? pairState.partnerName : "相手";

  const finish = () => {
    router.dismissAll();
  };

  return (
    <View testID="notification-priming-screen" className="flex-1 bg-linen">
      <View className="flex-1 items-center justify-center px-9">
        <View className="relative">
          <ChaloFace width={104} />
          <View className="absolute -right-3.5 -top-2 h-[34px] w-[34px] items-center justify-center rounded-full bg-plum shadow-accent">
            <Icon name="bell" size={17} color={palette.blush} />
          </View>
        </View>
        <Text className="mt-[22px] text-center font-zen-black text-[22px] text-ink">
          通知をオンにしませんか？
        </Text>
        <Text className="mt-3 text-center font-zen-medium text-[13px] leading-6 text-taupe">
          {partnerName} がプランをつくったときや、{"\n"}
          期限が近づいたときにお知らせします。
        </Text>
      </View>

      <View
        className="gap-3 px-6"
        style={{ paddingBottom: insets.bottom + 24 }}
      >
        <Button
          testID="notification-priming-allow-button"
          label="許可する"
          onPress={finish}
        />
        <Button
          testID="notification-priming-later-button"
          label="あとで"
          variant="ghost"
          onPress={finish}
        />
      </View>
    </View>
  );
}
