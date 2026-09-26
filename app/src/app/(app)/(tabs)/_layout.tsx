import { NativeTabs } from "expo-router/unstable-native-tabs";

import { palette } from "@global/constants/palette";

// 3タブ（プラン・おわったプラン・設定）。iOS 純正の UITabBar（NativeTabs）で描き、
// iOS 26 ではリキッドグラスになる（Issue #106・adr/0026）。
// スクロールでの最小化はしない：タブ3つだけなので常に見えている方が分かりやすく、
// ホームの追加ボタンとの位置関係も安定する。
// testID は UITabBarItem の accessibilityIdentifier になり、Maestro から引ける。
export default function TabsLayout() {
  return (
    <NativeTabs
      tintColor={palette.ink}
      iconColor={{ default: palette.stone, selected: palette.ink }}
      minimizeBehavior="never"
    >
      <NativeTabs.Trigger name="index" testID="tab-plans">
        <NativeTabs.Trigger.Icon
          sf={{ default: "pawprint", selected: "pawprint.fill" }}
        />
        <NativeTabs.Trigger.Label>プラン</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="done" testID="tab-done">
        <NativeTabs.Trigger.Icon
          sf={{
            default: "checkmark.circle",
            selected: "checkmark.circle.fill",
          }}
        />
        <NativeTabs.Trigger.Label>おわったプラン</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings" testID="tab-settings">
        <NativeTabs.Trigger.Icon
          sf={{ default: "gearshape", selected: "gearshape.fill" }}
        />
        <NativeTabs.Trigger.Label>設定</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
