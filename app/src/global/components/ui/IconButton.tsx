import { Pressable } from "react-native";

import { palette } from "@global/constants/palette";

import { Icon, type IconName } from "./Icon";

type IconButtonProps = {
  icon: IconName;
  onPress?: () => void;
  /** アイコンの色。既定は焦げ茶 */
  color?: string;
  iconSize?: number;
  testID?: string;
};

// 画面ヘッダーの丸ボタン（戻る・編集・削除。D-1 等）。
export function IconButton({
  icon,
  onPress,
  color = palette.ink,
  iconSize = 15,
  testID,
}: IconButtonProps) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      hitSlop={8}
      className="h-9 w-9 items-center justify-center rounded-full bg-paper shadow-header active:opacity-70"
    >
      <Icon name={icon} size={iconSize} color={color} />
    </Pressable>
  );
}
