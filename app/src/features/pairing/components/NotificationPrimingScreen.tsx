import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useRequestNotificationPermission } from "@features/notifications";
import { ChaloFace } from "@global/components/shared";
import { Button, Icon } from "@global/components/ui";
import { palette } from "@global/constants/palette";

import { usePairState } from "../hooks/usePairState";

// 通知プライミング（B-6。ペア成立直後の JIT）。
// iOS のシステムダイアログは実質1回しか出せないため、「許可する」を選んだ
// 前向きなときだけ実要求する。「あとで」は要求せず閉じる（domain/onboarding.md）。
export function NotificationPrimingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: pairState } = usePairState();
  const requestPermission = useRequestNotificationPermission();

  const partnerName =
    pairState?.status === "paired" ? pairState.partnerName : "相手";

  const finish = () => {
    router.dismissAll();
  };

  const handleAllow = () => {
    // 許可・拒否のどちらを選んでも画面は閉じる（結果は設定 E-1 で確認できる）
    requestPermission.mutate(undefined, { onSettled: finish });
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
        <Text className="mt-[22px] text-center text-[22px] font-black text-ink">
          通知をオンにしませんか？
        </Text>
        <Text className="mt-3 text-center text-[13px] font-medium leading-6 text-taupe">
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
          onPress={handleAllow}
          disabled={requestPermission.isPending}
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
