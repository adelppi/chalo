import { focusManager, QueryClient } from "@tanstack/react-query";
import { AppState } from "react-native";

// 同期戦略（adr/0004）: キャッシュを即表示しつつ、起動/復帰・画面遷移時に裏で再取得する。
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 常に stale 扱いにして、マウント・フォアグラウンド復帰のたびに裏で再取得する。
      staleTime: 0,
    },
  },
});

// React Native には window focus がないため、AppState で focusManager を結線する
// （TanStack Query 公式の React Native パターン）。active 復帰で表示中クエリが再取得される。
AppState.addEventListener("change", (state) => {
  focusManager.setFocused(state === "active");
});
