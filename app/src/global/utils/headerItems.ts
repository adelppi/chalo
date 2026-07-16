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
  /**
   * iOS 純正の大タイトル（headerLargeTitle）で表示するタイトル（D-1）。
   * 指定するとネイティブヘッダーがタイトルを描く（最上部は左寄せの大タイトル、
   * スクロールでヘッダー中央の小タイトルへ収まる）。指定時は画面コンテンツ側で
   * タイトルを重複して描かず、ScrollView に contentInsetAdjustmentBehavior="automatic"
   * を付けること。未指定なら従来どおりタイトルは空でコンテンツ側に委ねる。
   */
  largeTitle?: string;
};

// 戻る（+右アクション）だけのネイティブヘッダー共通設定（旧 BackHeader 相当）。
// 影のない linen 背景に統一する。タイトルは既定では空にして画面コンテンツ側に委ね、
// largeTitle 指定時のみ iOS 純正の大タイトルをネイティブヘッダーで描く。
export function backHeaderOptions({
  onBack,
  right,
  largeTitle,
}: BackHeaderOptionsArgs): NativeStackNavigationOptions {
  return {
    headerShown: true,
    title: largeTitle ?? "",
    headerShadowVisible: false,
    headerStyle: { backgroundColor: palette.linen },
    headerBackVisible: false,
    // 純正の既定スタイルに合わせるため、大タイトルのフォント・色は上書きしない。
    // 大タイトル部の背景も linen に統一し、影は出さない（headerShadowVisible と揃える）。
    ...(largeTitle != null
      ? {
          headerLargeTitleEnabled: true,
          headerLargeStyle: { backgroundColor: palette.linen },
          headerLargeTitleShadowVisible: false,
        }
      : {}),
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
