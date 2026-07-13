import { useState } from "react";
import { Linking, Text, View } from "react-native";

import { Button, Dialog } from "@global/components/ui";
import { useToastStore } from "@global/store/useToastStore";

import { useCalendarLink } from "../hooks/useCalendarLink";
import {
  useAddPlanToCalendar,
  useRemovePlanFromCalendar,
} from "../hooks/useCalendarMutations";
import {
  useCalendarPermission,
  useRequestCalendarPermission,
} from "../hooks/useCalendarPermission";
import { canAddToCalendar } from "../model/event";
import type { CalendarPlanFields } from "../model/types";

type PlanCalendarButtonProps = {
  plan: CalendarPlanFields;
};

// プラン詳細（D-1）のカレンダー連携ボタン。連携状態に応じて
// 「カレンダーに追加」⇄「カレンダーから削除」を出し分ける（domain/calendar.md）。
export function PlanCalendarButton({ plan }: PlanCalendarButtonProps) {
  const showToast = useToastStore((state) => state.show);
  const { data: link } = useCalendarLink(plan.id);
  const { data: permission } = useCalendarPermission();
  const requestPermission = useRequestCalendarPermission();
  const addToCalendar = useAddPlanToCalendar();
  const removeFromCalendar = useRemovePlanFromCalendar();
  const [openDialog, setOpenDialog] = useState<"priming" | "denied" | null>(
    null,
  );

  const linkable = canAddToCalendar(plan);
  const busy =
    requestPermission.isPending ||
    addToCalendar.isPending ||
    removeFromCalendar.isPending;

  const runAdd = () => {
    addToCalendar.mutate(plan, {
      onSuccess: () => {
        showToast("カレンダーに追加しました", { icon: "calendar" });
      },
      onError: () => {
        showToast(
          "カレンダーに追加できませんでした。もういちどためしてください。",
          { variant: "error" },
        );
      },
    });
  };

  // 権限は初回操作時に JIT で要求する（domain/onboarding.md）。
  // 未確認ならプライミング（F-4）を挟み、拒否済みなら iOS 設定への導線を出す。
  const handleAdd = () => {
    if (permission === "granted") {
      runAdd();
    } else if (permission === "denied") {
      setOpenDialog("denied");
    } else {
      setOpenDialog("priming");
    }
  };

  const handlePrimingConfirm = () => {
    setOpenDialog(null);
    requestPermission.mutate(undefined, {
      onSuccess: (result) => {
        // OS ダイアログで拒否されたら何もしない（次回押下で設定への導線を出す）
        if (result === "granted") {
          runAdd();
        }
      },
    });
  };

  // 「カレンダーから削除」は確認ダイアログなしで即実行（domain/calendar.md）
  const handleRemove = () => {
    removeFromCalendar.mutate(plan.id, {
      onSuccess: () => {
        showToast("カレンダーから削除しました", { icon: "calendar" });
      },
      onError: () => {
        showToast(
          "カレンダーから削除できませんでした。もういちどためしてください。",
          { variant: "error" },
        );
      },
    });
  };

  return (
    <View className="gap-2">
      {link ? (
        <Button
          testID="plan-detail-calendar-button"
          label="カレンダーから削除"
          icon="calendar"
          variant="outline"
          onPress={handleRemove}
          disabled={busy}
        />
      ) : (
        <Button
          testID="plan-detail-calendar-button"
          label="カレンダーに追加"
          icon="calendar-plus"
          variant="outline"
          onPress={handleAdd}
          disabled={!linkable || busy}
        />
      )}
      {!linkable ? (
        // 日付なしプランは追加不可。日付を入れると追加できる旨を補足する
        <Text className="text-center text-xs font-medium text-taupe">
          日付を入れると、カレンダーに追加できます
        </Text>
      ) : null}

      {/* F-4 カレンダー許可のプライミング（JIT） */}
      <Dialog
        visible={openDialog === "priming"}
        title="カレンダーと連携しますか？"
        message="日時が設定されているプランを、端末のカレンダーに追加できます。次の画面で許可してください。"
        cancelLabel="あとで"
        onCancel={() => setOpenDialog(null)}
        cancelTestID="plan-detail-calendar-cancel-button"
        confirm={{
          label: "連携する",
          onPress: handlePrimingConfirm,
          testID: "plan-detail-calendar-confirm-button",
        }}
      />

      {/* 権限拒否時は機能を縮退し、iOS 設定への導線を出す（non-functional.md） */}
      <Dialog
        visible={openDialog === "denied"}
        title="カレンダーを使う許可がありません"
        message="iOS の設定で chalo にカレンダーへのアクセスを許可すると、プランを追加できます。"
        cancelLabel="あとで"
        onCancel={() => setOpenDialog(null)}
        confirm={{
          label: "設定をひらく",
          onPress: () => {
            setOpenDialog(null);
            Linking.openSettings();
          },
          testID: "plan-detail-calendar-settings-button",
        }}
      />
    </View>
  );
}
