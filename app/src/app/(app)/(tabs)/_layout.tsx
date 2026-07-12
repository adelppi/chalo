import { Tabs } from "expo-router";

import { ChaloTabBar } from "@global/components/shared";

// 3タブ（プラン・おわったプラン・設定）。見た目はデザイン準拠の ChaloTabBar が描く。
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <ChaloTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: "プラン" }} />
      <Tabs.Screen name="done" options={{ title: "おわったプラン" }} />
      <Tabs.Screen name="settings" options={{ title: "設定" }} />
    </Tabs>
  );
}
