import { Stack } from "expo-router";

import { largeTitleHeaderOptions } from "@global/utils/headerItems";

// プランタブのスタック。見出しを純正の大タイトルで出すためだけに持つ（Issue #107）。
// 詳細・作成・編集はタブの外（(app) のスタック）へプッシュする。
export default function PlansTabLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={largeTitleHeaderOptions("プラン")} />
    </Stack>
  );
}
