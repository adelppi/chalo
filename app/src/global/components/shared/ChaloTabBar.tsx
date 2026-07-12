import type { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon, type IconName } from "@global/components/ui";
import { palette } from "@global/constants/palette";

// expo-router は react-navigation を内包していて直接 import できないため、
// Tabs の tabBar プロップから BottomTabBarProps 相当を導出する。
type TabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

// デザイン準拠のタブバー（C-1b 下部）。プラン＝足あと・おわったプラン＝チェック・設定＝歯車。
const TAB_ICONS: Record<string, IconName> = {
  index: "paw",
  done: "check-circle",
  settings: "gear",
};

export function ChaloTabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row border-t border-ink/10 bg-paper pt-2.5"
      style={{ paddingBottom: Math.max(insets.bottom, 20) + 10 }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title ?? route.name;
        const focused = state.index === index;
        const color = focused ? palette.ink : palette.stone;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            testID={`tab-${route.name === "index" ? "plans" : route.name}`}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            onPress={onPress}
            className="flex-1 items-center gap-[3px]"
          >
            <View className="h-[22px] items-center justify-center">
              <Icon
                name={TAB_ICONS[route.name] ?? "paw"}
                size={route.name === "index" ? 26 : 22}
                color={color}
              />
            </View>
            <Text
              className={`text-[10px] ${focused ? "font-bold" : "font-medium"}`}
              style={{ color }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
