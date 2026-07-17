import {
  focusManager,
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import { AppState } from "react-native";

import { log, type LogFields } from "@global/lib/logging";

// queryKey（例: ["calendar", "link", planId]）を記録用に変換する。
// 文字列トークンは種別、UUID は ids へ。値の検査は log 側の内容ゼロ方式が担保する。
function queryKeyLogFields(queryKey: readonly unknown[]): LogFields {
  const tokens: string[] = [];
  const ids: Record<string, string> = {};
  for (const part of queryKey) {
    if (typeof part !== "string") {
      continue;
    }
    if (/^[0-9a-f]{8}-/.test(part)) {
      ids[`id${Object.keys(ids).length + 1}`] = part;
    } else {
      tokens.push(part);
    }
  }
  return {
    detail: tokens.join("-"),
    ...(Object.keys(ids).length > 0 ? { ids } : {}),
  };
}

// 同期戦略（adr/0004）: キャッシュを即表示しつつ、起動/復帰・画面遷移時に裏で再取得する。
// Repository 層のエラーはここで一元的に記録する（adr/0011。query / mutation の
// 個別ハンドラに加えて必ず呼ばれる）。
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      log("error", "query_error", {
        error,
        ...queryKeyLogFields(query.queryKey),
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      log("error", "mutation_error", { error });
    },
  }),
  defaultOptions: {
    queries: {
      // 常に stale 扱いにして、マウント・フォアグラウンド復帰のたびに再取得する。
      staleTime: 0,
    },
  },
});

// React Native には window focus がないため、AppState で focusManager を結線する
// （TanStack Query 公式の React Native パターン）。active 復帰で表示中クエリが再取得される。
AppState.addEventListener("change", (state) => {
  focusManager.setFocused(state === "active");
});
