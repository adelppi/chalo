import { useCallback, useState } from "react";
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";

import { isHeadingScrolledPast } from "@global/utils/compactTitle";

// 画面内の見出しがスクロールで隠れたら、ナビバーに小さなタイトルを出す（Issue #107）。
// 見出しの Text に onHeadingLayout、ScrollView に onScroll を渡し、戻り値の
// headerTitle を Stack.Screen の title に使う。見出しは ScrollView の内容の
// 先頭付近に置く前提（onLayout の y が内容の上端基準になるため）。
export function useCompactHeaderTitle(title: string) {
  const [headingBottom, setHeadingBottom] = useState<number | null>(null);
  const [scrolledPast, setScrolledPast] = useState(false);

  const onHeadingLayout = useCallback((event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    setHeadingBottom(y + height);
  }, []);

  // 状態が切り替わるときだけ更新し、スクロールのたびに描画し直さない
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = isHeadingScrolledPast(
        event.nativeEvent.contentOffset.y,
        headingBottom,
      );
      setScrolledPast((prev) => (prev === next ? prev : next));
    },
    [headingBottom],
  );

  return {
    headerTitle: scrolledPast ? title : "",
    onHeadingLayout,
    onScroll,
  };
}
