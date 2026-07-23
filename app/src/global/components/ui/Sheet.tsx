import { BottomSheet, BottomSheetView } from "@expo/ui/community/bottom-sheet";
import { useState, type ReactNode } from "react";
import { Dimensions, Pressable, ScrollView, Text, View } from "react-native";

import { palette } from "@global/constants/palette";
import { resolveSheetContentLayout } from "@global/utils/sheetContentLayout";

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
// iOS ネイティブのシート（@expo/ui/community/bottom-sheet → SwiftUI sheet）ベース（adr/0022）。
// スワイプダウン・背景タップで閉じる操作と、キーボード回避はネイティブ側が持つ。
export function Sheet({
  visible,
  title,
  onClose,
  action,
  children,
  testID,
}: SheetProps) {
  // 中身の自然な高さ。上限を超えたぶんはシートの中でスクロールさせる。
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);
  const { height, scrollable } = resolveSheetContentLayout({
    measuredHeight,
    maxHeight: MAX_SHEET_HEIGHT,
  });

  return (
    <BottomSheet
      index={visible ? 0 : -1}
      onClose={onClose}
      // iOS ではスワイプダウンと背景タップの両方がこれで有効になる（片方だけにはできない）。
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: palette.paper }}
    >
      <BottomSheetView>
        <ScrollView
          testID={testID}
          style={{ height }}
          scrollEnabled={scrollable}
          // 既定（never）だと、キーボード表示中の最初のタップがキーボードを閉じるだけで
          // 消費され、「決定」等が押せない。
          keyboardShouldPersistTaps="handled"
          // 高さを指定していない間もスクロール内容の自然な高さは測れる。
          onContentSizeChange={(_, contentHeight) =>
            setMeasuredHeight(contentHeight)
          }
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
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
}
