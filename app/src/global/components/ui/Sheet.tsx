import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";

import { palette } from "@global/constants/palette";

// 中身が長い場合(既定カレンダー選択の一覧等)に画面いっぱいまで伸びきらないための上限。
const MAX_SHEET_HEIGHT = Dimensions.get("window").height * 0.7;

type SheetProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  /** 右上のテキストアクション（クリア 等） */
  action?: { label: string; onPress: () => void; testID?: string };
  children: ReactNode;
  testID?: string;
};

// 下から重なるシート（C-3b 日時ピッカー等）。うしろの画面は見えたまま。
// @gorhom/bottom-sheet ベース（adr/0020）。visible の変化を present/dismiss に橋渡しする。
export function Sheet({
  visible,
  title,
  onClose,
  action,
  children,
  testID,
}: SheetProps) {
  const sheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.35}
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      onDismiss={onClose}
      enableDynamicSizing
      maxDynamicContentSize={MAX_SHEET_HEIGHT}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: palette.paper,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
      }}
      handleIndicatorStyle={{
        backgroundColor: palette.wheat,
        width: 40,
        height: 5,
      }}
    >
      <BottomSheetScrollView
        testID={testID}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 4,
          paddingBottom: 48,
        }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-ink">{title}</Text>
          {action ? (
            <Pressable
              onPress={action.onPress}
              hitSlop={8}
              testID={action.testID}
            >
              <Text className="text-sm font-medium text-stone">
                {action.label}
              </Text>
            </Pressable>
          ) : null}
        </View>
        {children}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
