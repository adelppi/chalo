import { Stack } from "expo-router";

import { largeTitleHeaderOptions } from "@global/utils/headerItems";

// 設定タブのスタック。見出しを純正の大タイトルで出すためだけに持つ（Issue #107）。
export default function SettingsTabLayout() {
  return (
    <Stack>
      <Stack.Screen name="settings" options={largeTitleHeaderOptions("設定")} />
    </Stack>
  );
}
