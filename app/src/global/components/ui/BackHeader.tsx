import { useRouter } from "expo-router";
import { type ReactNode } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { palette } from "@global/constants/palette";

import { Icon } from "./Icon";

type BackHeaderProps = {
  /** 戻る以外の右側アクション（D-1 の編集/削除など） */
  right?: ReactNode;
  /** 戻り先を変えたいとき（既定は router.back()） */
  onBack?: () => void;
  testID?: string;
};

// 画面内ヘッダー行（戻る + 右アクション。C-3・D-1・D-2・B-2・B-3）。
// iOS 26 の Liquid Glass ヘッダーだとボタンがガラスのカプセルに包まれて
// デザインと乖離するため、ナビゲーションヘッダーは使わず背景の上に
// 透明の円形ボタンを描く。戻るスワイプはネイティブのまま有効。
export function BackHeader({ right, onBack, testID }: BackHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      className="flex-row items-center justify-between px-6"
      style={{ paddingTop: insets.top + 8 }}
    >
      <Pressable
        testID={testID}
        hitSlop={8}
        onPress={onBack ?? (() => router.back())}
        className="-ml-2 h-10 w-10 items-center justify-center rounded-full active:opacity-60"
      >
        <Icon name="chevron-left" size={16} color={palette.ink} />
      </Pressable>
      {right}
    </View>
  );
}
