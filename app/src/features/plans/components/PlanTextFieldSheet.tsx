import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useState } from "react";
import { View } from "react-native";

import { Button, Sheet } from "@global/components/ui";
import { palette } from "@global/constants/palette";

type PlanTextFieldSheetProps = {
  visible: boolean;
  /** 「参考URL」「メモ」 */
  title: string;
  initialValue: string | null;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: "default" | "url";
  onConfirm: (value: string | null) => void;
  onClose: () => void;
  testID?: string;
};

// 参考URL・メモの入力シート。日時ピッカー（C-3b）と同じ作法で下から重なる。
// 開くたびに親が新しくマウントする前提（初期値は useState の初期化で受ける）。
export function PlanTextFieldSheet({
  visible,
  title,
  initialValue,
  placeholder,
  multiline = false,
  keyboardType = "default",
  onConfirm,
  onClose,
  testID,
}: PlanTextFieldSheetProps) {
  const [value, setValue] = useState(initialValue ?? "");

  return (
    <Sheet
      visible={visible}
      title={title}
      onClose={onClose}
      testID={testID}
      action={{
        label: "クリア",
        onPress: () => onConfirm(null),
      }}
    >
      <View className="mt-4">
        {/* @gorhom/bottom-sheet 提供の入力欄。シートの内部キーボード追従に登録され、
            通常の TextInput と違いキーボードに隠れずに表示され続ける(フォローアップ修正)。 */}
        <BottomSheetTextInput
          testID={testID ? `${testID}-input` : undefined}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor={palette.latte}
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoFocus
          className={`rounded-control bg-cream px-3.5 py-3 text-sm font-medium text-ink ${
            multiline ? "min-h-[96px]" : ""
          }`}
          style={multiline ? { textAlignVertical: "top" } : undefined}
        />
      </View>
      <View className="mt-4">
        <Button
          testID={testID ? `${testID}-confirm-button` : undefined}
          label="決定"
          onPress={() => {
            const trimmed = value.trim();
            onConfirm(trimmed.length > 0 ? trimmed : null);
          }}
        />
      </View>
    </Sheet>
  );
}
