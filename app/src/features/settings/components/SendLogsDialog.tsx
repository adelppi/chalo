import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { Dialog } from "@global/components/ui";
import { palette } from "@global/constants/palette";
import { useToastStore } from "@global/store/useToastStore";

type SendLogsDialogProps = {
  visible: boolean;
  onClose: () => void;
};

// ログを送信ダイアログ（F-1c）。モック段階のため送信はトースト表示のみ。
// 開くたびに親が新しくマウントする前提（ひとことは空欄から始まる）。
export function SendLogsDialog({ visible, onClose }: SendLogsDialogProps) {
  const showToast = useToastStore((state) => state.show);
  const [comment, setComment] = useState("");

  return (
    <Dialog
      visible={visible}
      title="ログを送信しますか？"
      message="不具合の調査のため、アプリの動作記録を開発チームに送ります。プランの中身や個人を特定する情報は含まれません。"
      onCancel={onClose}
      cancelTestID="settings-send-logs-cancel-button"
      confirm={{
        label: "送信する",
        icon: "send",
        onPress: () => {
          onClose();
          showToast("ログを送信しました。ありがとう！", {
            icon: "check-circle",
          });
        },
        testID: "settings-send-logs-confirm-button",
      }}
    >
      <View className="mt-1.5 gap-1.5">
        <Text className="text-[11px] font-bold tracking-[1px] text-stone">
          ひとこと（任意）
        </Text>
        <TextInput
          testID="settings-send-logs-comment-input"
          value={comment}
          onChangeText={setComment}
          placeholder="例：カレンダー追加が反映されない"
          placeholderTextColor={palette.stone}
          multiline
          className="min-h-[54px] rounded-control bg-cream px-3.5 py-3 text-[13px] font-medium text-ink"
          style={{ textAlignVertical: "top" }}
        />
      </View>
    </Dialog>
  );
}
