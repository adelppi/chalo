import { Stack } from "expo-router";

import { largeTitleHeaderOptions } from "@global/utils/headerItems";

// おわったプランタブのスタック。見出しを純正の大タイトルで出すためだけに持つ（Issue #107）。
export default function DoneTabLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="done"
        options={largeTitleHeaderOptions("おわったプラン")}
      />
    </Stack>
  );
}
