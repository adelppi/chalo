import { useState } from "react";
import { Text, View } from "react-native";

import { Dialog, Icon } from "@global/components/ui";
import { palette } from "@global/constants/palette";

type ExportPlansDialogProps = {
  visible: boolean;
  /** 「プラン 12件・おしまい 8件」の件数 */
  counts: { active: number; done: number };
  onClose: () => void;
};

// プランを書き出すダイアログ（F-1b）。確認 → 完了の2段階。
// モック段階のため、実際のファイル書き出し・共有は行わない。
// 開くたびに親が新しくマウントする前提（step は confirm から始まる）。
export function ExportPlansDialog({
  visible,
  counts,
  onClose,
}: ExportPlansDialogProps) {
  const [step, setStep] = useState<"confirm" | "done">("confirm");

  if (step === "confirm") {
    return (
      <Dialog
        visible={visible}
        title="プランを書き出しますか？"
        message="ふたりのプランとおしまいを、1つのテキストにまとめます。書き出したあと、共有や保存ができます。"
        onCancel={onClose}
        cancelTestID="settings-export-cancel-button"
        confirm={{
          label: "書き出す",
          icon: "tray-up",
          onPress: () => setStep("done"),
          testID: "settings-export-confirm-button",
        }}
      >
        <View className="mt-1.5 gap-1.5 rounded-[14px] bg-cream px-3.5 py-3">
          <View className="flex-row items-center gap-2">
            <Icon name="note" size={14} color={palette.taupe} />
            <Text className="font-zen-bold text-[12.5px] text-ink">
              プラン {counts.active}件・おしまい {counts.done}件
            </Text>
          </View>
          <Text className="pl-[22px] font-zen-medium text-[11.5px] text-stone">
            テキスト（.txt）でまとめます
          </Text>
        </View>
      </Dialog>
    );
  }

  return (
    <Dialog
      visible={visible}
      title="書き出しました"
      titleAccessory={
        <View className="h-[34px] w-[34px] items-center justify-center rounded-full bg-plum/[0.14]">
          <Icon name="check-circle" size={17} color={palette.plum} />
        </View>
      }
      message="「chalo-plans.txt」を用意しました。共有して保存しておきましょう。"
      cancelLabel="とじる"
      onCancel={onClose}
      cancelTestID="settings-export-close-button"
      confirm={{
        label: "共有",
        icon: "share",
        onPress: onClose,
        testID: "settings-export-share-button",
      }}
    />
  );
}
