import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { Dialog } from "@global/components/ui";
import { palette } from "@global/constants/palette";

import {
  PROFILE_NAME_MAX_LENGTH,
  type ProfileFieldValidation,
  profileNameErrorMessage,
} from "../model/profileValidation";

type EditProfileFieldDialogProps = {
  visible: boolean;
  title: string;
  label: string;
  initialValue: string;
  isSaving: boolean;
  /** 検証は呼び出し側が渡す（あなたの名前は空欄不可・よびかたは空欄可） */
  validate: (input: string) => ProfileFieldValidation;
  /** null は「未設定に戻す」（空欄を許す項目のみ起きる） */
  onSave: (value: string | null) => void;
  onClose: () => void;
  testIDPrefix: string;
  /** 未入力のときに薄く出す文字（よびかたでは相手の表示名を出す） */
  placeholder?: string;
  /** 入力欄の下に出す補足（よびかたの「空欄にすると表示名にもどる」等） */
  hint?: string;
};

// 「あなたの名前」「相手のよびかた」の編集ダイアログ（E-1）。
// 開くたびに親が新しくマウントする前提（SendLogsDialog 等と同じ流儀）。
export function EditProfileFieldDialog({
  visible,
  title,
  label,
  initialValue,
  isSaving,
  validate,
  onSave,
  onClose,
  testIDPrefix,
  placeholder,
  hint,
}: EditProfileFieldDialogProps) {
  const [value, setValue] = useState(initialValue);
  const validation = validate(value);
  const showError = !validation.valid && value.length > 0;

  return (
    <Dialog
      visible={visible}
      title={title}
      onCancel={onClose}
      cancelTestID={`${testIDPrefix}-cancel-button`}
      testID={`${testIDPrefix}-dialog`}
      confirm={{
        label: "保存",
        disabled: !validation.valid || isSaving,
        onPress: () => {
          if (validation.valid) {
            onSave(validation.value);
          }
        },
        testID: `${testIDPrefix}-confirm-button`,
      }}
    >
      <View className="mt-1.5 gap-1.5">
        <Text className="text-[11px] font-bold tracking-[1px] text-stone">
          {label}
        </Text>
        <TextInput
          testID={`${testIDPrefix}-input`}
          value={value}
          onChangeText={setValue}
          maxLength={PROFILE_NAME_MAX_LENGTH}
          placeholder={placeholder}
          placeholderTextColor={palette.latte}
          autoFocus
          selectionColor={palette.plum}
          className="rounded-control bg-cream px-3.5 py-3 text-[16px] font-medium text-ink"
        />
        {showError && !validation.valid ? (
          <Text className="text-xs font-medium text-rust">
            {profileNameErrorMessage(validation.reason)}
          </Text>
        ) : hint ? (
          <Text className="text-xs font-medium leading-5 text-stone">
            {hint}
          </Text>
        ) : null}
      </View>
    </Dialog>
  );
}
