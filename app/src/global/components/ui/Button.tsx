import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { Pressable, Text, View } from "react-native";

import { palette } from "@global/constants/palette";
import {
  resolveButtonGlass,
  type ButtonVariant,
} from "@global/utils/buttonGlass";

import { Icon, type IconName } from "./Icon";

type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconSize?: number;
  disabled?: boolean;
  /**
   * iOS 26 以上でリキッドグラスにするか（adr/0026）。既定は true。
   * ダイアログ・シートの中では false にして平面のまま描く
   */
  glass?: boolean;
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

// 高さと角丸は Claude Design のセット（ダイアログ内 46/14・画面 CTA 54/16・おしまい 56/18）
const containerBySize: Record<ButtonSize, string> = {
  sm: "h-[46px] rounded-control",
  md: "h-[54px] rounded-button",
  lg: "h-[56px] rounded-field",
};

// GlassView は className を受け取れないため、containerBySize と同じ角丸を数値でも持つ
// （adr/0016 の逃げ道。値は tailwind.config の control / button / field）
const glassRadiusBySize: Record<ButtonSize, number> = {
  sm: 14,
  md: 16,
  lg: 18,
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
  glass = true,
  testID,
  className = "",
}: ButtonProps) {
  // 非活性は焦げ茶の薄塗り（B-3 つながる・C-3 追加する のデザイン）
  const container = disabled
    ? `bg-ink/25 ${containerBySize[size]}`
    : `${containerByVariant[variant]} ${containerBySize[size]}`;
  const labelColor = disabled ? "text-paper" : labelColorByVariant[variant];
  // 枠線ボタンの md はデザインでは 15px（D-1 カレンダーに追加）
  const labelSize =
    variant === "outline" && size === "md" ? "text-[15px]" : labelBySize[size];

  const content = (
    <>
      {icon ? (
        <Icon
          name={icon}
          size={iconSize}
          color={disabled ? palette.paper : iconColorByVariant[variant]}
        />
      ) : null}
      <Text
        className={`${labelWeightByVariant[variant]} ${labelSize} ${labelColor}`}
      >
        {label}
      </Text>
    </>
  );

  const glassStyle = resolveButtonGlass({
    variant,
    disabled,
    enabled: glass,
    available: isLiquidGlassAvailable(),
  });

  // 押下時の揺らぎ・光はネイティブのガラス（isInteractive）が出すため active:opacity は付けない
  if (glassStyle) {
    return (
      <Pressable testID={testID} onPress={onPress}>
        <GlassView
          isInteractive
          glassEffectStyle="regular"
          tintColor={glassStyle.tintColor}
          style={{ borderRadius: glassRadiusBySize[size] }}
        >
          <View
            className={`flex-row items-center justify-center gap-2 ${containerBySize[size]} ${className}`}
          >
            {content}
          </View>
        </GlassView>
      </Pressable>
    );
  }

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center justify-center gap-2 active:opacity-70 ${container} ${className}`}
    >
      {content}
    </Pressable>
  );
}
