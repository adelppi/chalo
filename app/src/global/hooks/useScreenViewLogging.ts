import { useGlobalSearchParams, useSegments } from "expo-router";
import { useEffect } from "react";

import { buildScreenViewFields, log } from "@global/lib/logging";

// 画面遷移のログ計装（features.md 11.4・adr/0011）。
// useSegments() は動的部分を "[id]" のまま返すためルート名に値が混ざらない。
// params は buildScreenViewFields が UUID だけを通す（内容ゼロ方式）。
export function useScreenViewLogging(): void {
  const segments = useSegments();
  const params = useGlobalSearchParams();
  const fields = buildScreenViewFields(segments, params);
  // 配列・オブジェクトの参照は描画ごとに変わるため、記録内容そのもので変化を見る
  // （同じルートでも UUID param が変われば別画面として記録する）
  const key = JSON.stringify(fields);

  useEffect(() => {
    log("info", "screen_view", fields);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
