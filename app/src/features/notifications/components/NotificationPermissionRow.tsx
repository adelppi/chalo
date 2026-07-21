import { Linking, Pressable, Text, View } from "react-native";

import {
  useNotificationPermission,
  useRequestNotificationPermission,
} from "../hooks/useNotificationPermission";

// 設定画面（E-1）の通知行。SettingsScreen のカードに埋め込む。

/** 「通知」許可行。未確認なら JIT 要求、拒否済みなら iOS 設定へ。許可ずみは行ごと非表示（features.md 9.4） */
export function NotificationPermissionRow() {
  const { data: permission } = useNotificationPermission();
  const requestPermission = useRequestNotificationPermission();

  if (permission === "granted") {
    return null;
  }

  const handlePress = () => {
    if (permission === "denied") {
      Linking.openSettings();
    } else {
      requestPermission.mutate();
    }
  };

  return (
    <View className="flex-row items-center justify-between border-b border-sand px-[18px] py-3.5">
      <Text className="text-[17px] font-medium text-ink">通知</Text>
      <Pressable
        testID="settings-notification-permission-button"
        onPress={handlePress}
        disabled={requestPermission.isPending}
        className="rounded-full bg-plum px-[15px] py-[7px] active:opacity-70"
      >
        <Text className="text-[13px] font-semibold text-blush">許可する</Text>
      </Pressable>
    </View>
  );
}
