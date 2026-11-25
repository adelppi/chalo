import { palette } from "@global/constants/palette";

export type ButtonVariant =
  | "primary" // 焦げ茶ベタ（主要アクション）
  | "accent" // plum ベタ（おしまいにする）
  | "outline" // 枠線のみ
  | "cream" // 明色ベタ（暗背景の上で使う）
  | "destructive" // rust ベタ（削除）
  | "ghost"; // テキストのみ（あとで 等）

// ガラスに付ける色。undefined は色なしのガラス
const tintByVariant: Record<
  Exclude<ButtonVariant, "ghost">,
  string | undefined
> = {
  primary: palette.ink,
  accent: palette.plum,
  outline: undefined,
  cream: palette.linen,
  destructive: palette.rust,
};

type ResolveButtonGlassArgs = {
  variant: ButtonVariant;
  disabled: boolean;
  /** 呼び出し側がガラスを望むか（ダイアログ・シート内では false） */
  enabled: boolean;
  /** 端末でリキッドグラスが使えるか（iOS 26 以上） */
  available: boolean;
};

// ボタンをリキッドグラスで描くか、描くなら何色を付けるかを決める（adr/0026・Issue #125）。
// null のときは従来の平面のボタンで描く。
export function resolveButtonGlass({
  variant,
  disabled,
  enabled,
  available,
}: ResolveButtonGlassArgs): { tintColor: string | undefined } | null {
  if (!enabled || !available || disabled || variant === "ghost") {
    return null;
  }
  return { tintColor: tintByVariant[variant] };
}
