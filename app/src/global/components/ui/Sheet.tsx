import { type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";

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
export function Sheet({
  visible,
  title,
  onClose,
  action,
  children,
  testID,
}: SheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-ink/35">
        <Pressable className="flex-1" onPress={onClose} />
        <KeyboardAvoidingView behavior="padding">
          <View
            testID={testID}
            className="rounded-t-sheet bg-paper px-6 pb-12 pt-3"
          >
            <View className="mb-[18px] h-[5px] w-10 self-center rounded-full bg-wheat" />
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
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
