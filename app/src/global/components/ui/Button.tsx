import { Pressable, Text } from "react-native";

import { palette } from "@global/constants/palette";

import { Icon, type IconName } from "./Icon";

type ButtonVariant =
  | "primary" // 焦げ茶ベタ（主要アクション）
  | "accent" // plum ベタ（おしまいにする）
  | "outline" // 枠線のみ
  | "cream" // 明色ベタ（暗背景の上で使う）
  | "destructive" // rust ベタ（削除）
  | "ghost"; // テキストのみ（あとで 等）

type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconSize?: number;
  disabled?: boolean;
  testID?: string;
  className?: string;
};

const containerByVariant: Record<ButtonVariant, string> = {
  primary: "bg-ink",
  accent: "bg-plum shadow-accent",
  outline: "border-2 border-ink/20",
  cream: "bg-linen",
  destructive: "bg-rust",
  ghost: "",
};

const labelColorByVariant: Record<ButtonVariant, string> = {
  primary: "text-linen",
  accent: "text-blush",
  outline: "text-ink",
  cream: "text-ink",
  destructive: "text-paper",
  ghost: "text-stone",
};

const iconColorByVariant: Record<ButtonVariant, string> = {
  primary: palette.linen,
  accent: palette.blush,
  outline: palette.ink,
  cream: palette.ink,
  destructive: palette.paper,
  ghost: palette.stone,
};

const containerBySize: Record<ButtonSize, string> = {
  sm: "h-[46px] rounded-card",
  md: "h-[54px] rounded-card",
  lg: "h-[56px] rounded-card",
};

const labelBySize: Record<ButtonSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-base",
};

// ラベルのウェイト（Claude Design：ベタ塗りは 600、枠線・明色・テキストは 500）
const labelWeightByVariant: Record<ButtonVariant, string> = {
  primary: "font-semibold",
  accent: "font-semibold",
  destructive: "font-semibold",
  outline: "font-medium",
  cream: "font-medium",
  ghost: "font-medium",
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  icon,
  iconSize = 16,
  disabled = false,
  testID,
  className = "",
}: ButtonProps) {
  // 非活性は焦げ茶の薄塗り（B-3 つながる・C-3 追加する のデザイン）
  const container = disabled
    ? `bg-ink/25 ${containerBySize[size]}`
    : `${containerByVariant[variant]} ${containerBySize[size]}`;
  const labelColor = disabled ? "text-paper" : labelColorByVariant[variant];

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center justify-center gap-2 active:opacity-70 ${container} ${className}`}
    >
      {icon ? (
        <Icon
          name={icon}
          size={iconSize}
          color={disabled ? palette.paper : iconColorByVariant[variant]}
        />
      ) : null}
      <Text
        className={`${labelWeightByVariant[variant]} ${labelBySize[size]} ${labelColor}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
