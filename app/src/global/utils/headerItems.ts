import type {
  NativeStackHeaderItem,
  NativeStackNavigationOptions,
} from "expo-router";
import type { SFSymbol } from "sf-symbols-typescript";

import { palette } from "@global/constants/palette";

type IconHeaderItemOptions = {
  symbol: SFSymbol;
  onPress: () => void;
  accessibilityLabel: string;
  tintColor?: string;
  disabled?: boolean;
};

// アイコンのみのネイティブヘッダーボタン。iOS 26 の Liquid Glass で複数ボタンが
// 1つのカプセルに融合しないよう sharesBackground: false にする
// （iOS 26 未満では単に無視され通常表示にフォールバックする）。
// testID を持てないため、Maestro からは accessibilityLabel で参照する。
export function iconHeaderItem({
  symbol,
  onPress,
  accessibilityLabel,
  tintColor,
  disabled,
}: IconHeaderItemOptions): NativeStackHeaderItem {
  return {
    type: "button",
    label: "",
    accessibilityLabel,
    icon: { type: "sfSymbol", name: symbol },
    onPress,
    tintColor,
    disabled,
    sharesBackground: false,
  };
}

type BackHeaderOptionsArgs = {
  onBack: () => void;
  /** 編集・削除等、戻る以外の右側アクション（D-1 等） */
  right?: NativeStackHeaderItem[];
};

// backHeaderOptions のうち静的な部分だけを切り出したもの。ルーター側（app/(app)/_layout.tsx）の
// Stack.Screen の options に直接渡し、画面マウント時点から headerShown: true を確定させるために使う。
// onBack 等のコールバックは画面側の Stack.Screen（backHeaderOptions）で動的に補う。
// （Issue #48：group の既定 headerShown: false から画面マウント後に true へ切り替わると、
// 初回プッシュ時だけヘッダー分のレイアウトが後追いで反映され、タイトルが隠れてから
// 「ガクッ」と下がる。ルーター側で最初から headerShown: true にして防ぐ。）
export const backHeaderStaticOptions: NativeStackNavigationOptions = {
  headerShown: true,
  title: "",
  headerShadowVisible: false,
  headerStyle: { backgroundColor: palette.linen },
  headerBackVisible: false,
};

// 戻る（+右アクション）だけのネイティブヘッダー共通設定（旧 BackHeader 相当）。
// タイトルは画面コンテンツ側で描くため空にし、影のない linen 背景に統一する。
export function backHeaderOptions({
  onBack,
  right,
}: BackHeaderOptionsArgs): NativeStackNavigationOptions {
  return {
    ...backHeaderStaticOptions,
    unstable_headerLeftItems: () => [
      iconHeaderItem({
        symbol: "chevron.left",
        onPress: onBack,
        accessibilityLabel: "戻る",
      }),
    ],
    ...(right ? { unstable_headerRightItems: () => right } : {}),
  };
}
