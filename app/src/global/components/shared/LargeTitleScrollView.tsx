import { useState } from "react";
import { Animated, type ScrollViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { palette } from "@global/constants/palette";

// ナビバー（大タイトルが縮んだ後の高さ 44pt）と、その下で中身になじませる分
const FADE_HEIGHT_BELOW_STATUS_BAR = 56;

// 最初のスクロールイベントが届くまでは、先頭の中身に重ならないよう画面の外に置く
const OFFSCREEN_Y = -1000;

// 大タイトルのタブ画面（プラン・おわったプラン・設定）の ScrollView（adr/0026・Issue #127）。
// 純正のスクロールエッジ効果は、下を通る中身の明るさに合わせて色を変える。暗いカードが
// 通ると灰色になり、焦げ茶のタイトルが読めなくなるため、linen のグラデーションを中身に
// 重ねて、バーの下をいつも明るく保つ。純正のぼかしの下に入るよう、ナビバーではなく
// スクロールの中に置き、スクロール量だけずらして画面の上端に留める。
// 静止時は背景と同じ色なので見えない。
export function LargeTitleScrollView({ children, ...props }: ScrollViewProps) {
  const insets = useSafeAreaInsets();
  const [scrollY] = useState(() => new Animated.Value(OFFSCREEN_Y));
  const [onScroll] = useState(() =>
    Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
      useNativeDriver: true,
    }),
  );

  return (
    <Animated.ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      {...props}
      onScroll={onScroll}
      scrollEventThrottle={1}
    >
      {children}
      <Animated.View
        pointerEvents="none"
        className="absolute inset-x-0 top-0 z-10"
        style={{
          height: insets.top + FADE_HEIGHT_BELOW_STATUS_BAR,
          transform: [{ translateY: scrollY }],
          experimental_backgroundImage: `linear-gradient(to bottom, ${palette.linen} 0%, ${palette.linen}EB 60%, ${palette.linen}00 100%)`,
        }}
      />
    </Animated.ScrollView>
  );
}
