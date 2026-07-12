import { Text, View } from "react-native";

import { palette } from "@global/constants/palette";

import { Icon, type IconName } from "./Icon";

type ChipTone =
  | "camel" // 日付（明背景上）
  | "blush" // 期限・場所（plum 系）
  | "on-dark"; // 暗色カードの上

type ChipProps = {
  label: string;
  icon?: IconName;
  tone?: ChipTone;
  /** D-1 のチップはひと回り大きい */
  size?: "sm" | "md";
  testID?: string;
};

const containerByTone: Record<ChipTone, string> = {
  camel: "bg-camel/[0.22]",
  blush: "bg-blush",
  "on-dark": "bg-linen/[0.18]",
};

const textByTone: Record<ChipTone, string> = {
  camel: "text-ink",
  blush: "text-plum",
  "on-dark": "text-linen",
};

const iconColorByTone: Record<ChipTone, string> = {
  camel: palette.ink,
  blush: palette.plum,
  "on-dark": palette.linen,
};

export function Chip({
  label,
  icon,
  tone = "camel",
  size = "sm",
  testID,
}: ChipProps) {
  const padding = size === "md" ? "px-3 py-1.5" : "px-2.5 py-1";
  const textSize = size === "md" ? "text-[13px]" : "text-xs";

  return (
    <View
      testID={testID}
      className={`flex-row items-center gap-[5px] self-start rounded-full ${padding} ${containerByTone[tone]}`}
    >
      {icon ? (
        <Icon
          name={icon}
          size={size === "md" ? 13 : 12}
          color={iconColorByTone[tone]}
        />
      ) : null}
      <Text className={`font-zen-bold ${textSize} ${textByTone[tone]}`}>
        {label}
      </Text>
    </View>
  );
}
