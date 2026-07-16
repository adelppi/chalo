import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PawPrint } from "@global/components/shared";
import { Icon } from "@global/components/ui";
import { palette } from "@global/constants/palette";

type PairingStartScreenProps = {
  /**
   * 「ひとりではじめる」タップ時、遷移前に実行する（オンボーディング完了の記録）。
   * feature 間の直接依存を避けるため、呼び出し元のルート（app/(app)/pairing/index.tsx）
   * から注入する（adr/0015）。
   */
  onSolo?: () => void | Promise<void>;
};

// ペアをはじめる（B-1。オンボーディング A4「ペアの開始」を兼ねる。domain/onboarding.md）。
export function PairingStartScreen({ onSolo }: PairingStartScreenProps = {}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // 「ひとりではじめる」＝ソロで続ける確定。オンボーディング中に選んでも、
  // 設定 E-1b から開いて選んでも、以降オンボーディングは再表示しない。
  // dismissTo("/") で (tabs) まで戻す：onSolo（オンボーディング完了の記録）の
  // invalidateQueries が解決した直後は、(app)/_layout 側の再レンダー（ガード
  // needsOnboarding の更新）がまだコミットされていないことがあり、その状態で
  // 遷移すると (tabs) がまだ含まれず無反応になる。setTimeout で1マクロタスク
  // 遅らせて緩和する（Issue #40）。
  // 実機検証メモ：サインイン直後に自動化ツールで極端に速く A3→A4→スキップを
  // 連続実行すると、この defer だけでは解消しないタイミング（再レンダーの
  // 確定に数秒かかるケース）を観測した。ただし実際のユーザーは Google/Apple
  // サインインの往復と画面を読む時間が数秒単位で必ず入るため、実運用では
  // 再現しない前提としている。将来 UI テストで似た無反応が出た場合はここを疑う。
  const handleSolo = async () => {
    await onSolo?.();
    setTimeout(() => {
      router.dismissTo("/");
    }, 0);
  };

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
            onPress={handleSolo}
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
