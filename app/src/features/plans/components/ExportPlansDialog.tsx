import { useMemo, useState } from "react";
import { Text, View } from "react-native";

import { Dialog, Icon } from "@global/components/ui";
import { palette } from "@global/constants/palette";
import { useToastStore } from "@global/store/useToastStore";

import { useExportPlans } from "../hooks/useExportPlans";
import { EXPORT_FILE_NAME } from "../model/exportText";
import { countPlanStatuses } from "../model/sections";
import type { Plan } from "../model/types";

type ExportPlansDialogProps = {
  visible: boolean;
  /** 書き出す全プラン（自分＋相手、ソロなら自分のみ） */
  plans: Plan[];
  onClose: () => void;
};

// プランを書き出すダイアログ（F-1b）。確認 → 完了の2段階。
// 「書き出す」でテキストを整形し、「共有」で .txt を iOS 共有シートへ渡す。
// 設定（E-1）とロック画面（partner-left）の双方から plans のバレル経由で使う（Issue #70）。
// 開くたびに親が新しくマウントする前提（step は confirm から始まる）。
export function ExportPlansDialog({
  visible,
  plans,
  onClose,
}: ExportPlansDialogProps) {
  const [step, setStep] = useState<"confirm" | "done">("confirm");
  const showToast = useToastStore((state) => state.show);
  const exportPlans = useExportPlans();

  const counts = useMemo(() => countPlanStatuses(plans, new Date()), [plans]);

  const handleShare = () => {
    if (exportPlans.isPending) {
      return;
    }
    exportPlans.mutate(plans, {
      onError: () => {
        showToast("共有できませんでした。もういちどためしてください。", {
          variant: "error",
        });
      },
    });
  };

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
          onPress: () => setStep("done"),
          testID: "settings-export-confirm-button",
        }}
      >
        <View className="mt-1.5 gap-1.5 rounded-control bg-cream px-3.5 py-3">
          <View className="flex-row items-center gap-2">
            <Icon name="note" size={14} color={palette.taupe} />
            <Text className="text-[12.5px] font-medium text-ink">
              プラン {counts.active}件・おしまい {counts.done}件
            </Text>
          </View>
          <Text className="pl-[22px] text-[11.5px] font-medium text-stone">
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
      message={`「${EXPORT_FILE_NAME}」を用意しました。共有して保存しておきましょう。`}
      cancelLabel="とじる"
      onCancel={onClose}
      cancelTestID="settings-export-close-button"
      confirm={{
        label: "共有",
        icon: "share",
        onPress: handleShare,
        testID: "settings-export-share-button",
      }}
    />
  );
}
