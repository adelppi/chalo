import { useState } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";

import { Icon, Sheet } from "@global/components/ui";
import { palette } from "@global/constants/palette";

import {
  useDefaultCalendarId,
  useDeviceCalendars,
  useSetDefaultCalendar,
  useSystemDefaultCalendarId,
} from "../hooks/useDefaultCalendar";
import {
  useCalendarPermission,
  useRequestCalendarPermission,
} from "../hooks/useCalendarPermission";
import type { DeviceCalendar } from "../model/types";

// 設定画面（E-1）のカレンダー行。SettingsScreen のカードに埋め込む。

/** 「カレンダー」許可行。未確認なら JIT 要求、拒否済みなら iOS 設定へ（features.md 9.4） */
export function CalendarPermissionRow() {
  const { data: permission } = useCalendarPermission();
  const requestPermission = useRequestCalendarPermission();

  const handlePress = () => {
    if (permission === "denied") {
      Linking.openSettings();
    } else {
      requestPermission.mutate();
    }
  };

  return (
    <View className="flex-row items-center justify-between border-b border-sand px-[18px] py-3.5">
      <Text className="text-[17px] font-medium text-ink">カレンダー</Text>
      {permission === "granted" ? (
        <Text className="text-[13px] font-semibold text-stone">許可ずみ</Text>
      ) : (
        <Pressable
          testID="settings-calendar-permission-button"
          onPress={handlePress}
          disabled={requestPermission.isPending}
          className="rounded-full bg-plum px-[15px] py-[7px] active:opacity-70"
        >
          <Text className="text-[13px] font-semibold text-blush">許可する</Text>
        </Pressable>
      )}
    </View>
  );
}

/** 「既定カレンダーをえらぶ」行（features.md 9.5）。未選択時は端末デフォルトが追加先になる */
export function DefaultCalendarRow() {
  const { data: permission } = useCalendarPermission();
  const requestPermission = useRequestCalendarPermission();
  const granted = permission === "granted";
  const { data: calendars } = useDeviceCalendars(granted);
  const { data: defaultCalendarId } = useDefaultCalendarId();
  const { data: systemDefaultCalendarId } = useSystemDefaultCalendarId(granted);
  const setDefaultCalendar = useSetDefaultCalendar();
  const [sheetVisible, setSheetVisible] = useState(false);

  // 表示値：選んだカレンダー。未選択ならフォールバック先の端末デフォルト
  const displayedId = defaultCalendarId ?? systemDefaultCalendarId ?? null;
  const displayedTitle =
    calendars?.find((calendar) => calendar.id === displayedId)?.title ?? null;

  const handlePress = () => {
    if (permission === "granted") {
      setSheetVisible(true);
    } else if (permission === "denied") {
      Linking.openSettings();
    } else {
      // JIT：許可されたらそのまま選択シートを開く
      requestPermission.mutate(undefined, {
        onSuccess: (result) => {
          if (result === "granted") {
            setSheetVisible(true);
          }
        },
      });
    }
  };

  const handleSelect = (calendar: DeviceCalendar) => {
    setDefaultCalendar.mutate(calendar.id, {
      onSuccess: () => setSheetVisible(false),
    });
  };

  return (
    <>
      <Pressable
        testID="settings-default-calendar-button"
        onPress={handlePress}
        className="flex-row items-center justify-between gap-2.5 px-[18px] py-4 active:opacity-70"
      >
        <Text className="text-[17px] font-medium text-ink">
          既定カレンダーをえらぶ
        </Text>
        <View className="flex-row items-center gap-2">
          {displayedTitle ? (
            <Text className="text-base font-semibold text-stone">
              {displayedTitle}
            </Text>
          ) : null}
          <Icon name="chevron-right" size={13} color={palette.latte} />
        </View>
      </Pressable>

      <Sheet
        visible={sheetVisible}
        title="既定カレンダーをえらぶ"
        onClose={() => setSheetVisible(false)}
        testID="settings-default-calendar-sheet"
      >
        <ScrollView
          className="mt-3 max-h-96"
          showsVerticalScrollIndicator={false}
        >
          {calendars?.length ? (
            calendars.map((calendar, index) => (
              <Pressable
                key={calendar.id}
                testID={`settings-default-calendar-item-${calendar.id}`}
                onPress={() => handleSelect(calendar)}
                className={`flex-row items-center gap-3 py-3.5 active:opacity-70 ${
                  index < calendars.length - 1 ? "border-b border-sand" : ""
                }`}
              >
                <View
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: calendar.color ?? palette.latte }}
                />
                <Text className="flex-1 text-[15px] font-medium text-ink">
                  {calendar.title}
                </Text>
                {calendar.id === displayedId ? (
                  <Icon name="check-circle" size={18} color={palette.plum} />
                ) : null}
              </Pressable>
            ))
          ) : (
            <Text className="py-4 text-center text-[13px] font-medium text-taupe">
              書き込めるカレンダーが見つかりません
            </Text>
          )}
        </ScrollView>
      </Sheet>
    </>
  );
}
