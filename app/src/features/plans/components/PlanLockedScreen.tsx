import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackHeader, Icon } from "@global/components/ui";
import { palette } from "@global/constants/palette";

import { usePlan } from "../hooks/usePlan";
import { formatDateLong } from "../model/format";

type PlanLockedScreenProps = {
  id: string;
  /** ロック保持者（相手）の表示名。編集ボタン押下時の判定結果から受け取る */
  lockedByName: string;
};

// F-9 編集ロック中の競合。編集ボタン押下時に相手のロック（TTL 内）を検出したら
// この画面に遷移する（adr/0005）。閲覧は詳細画面（D-1）で引き続き可能。
export function PlanLockedScreen({ id, lockedByName }: PlanLockedScreenProps) {
  const insets = useSafeAreaInsets();
  const { data: plan } = usePlan(id);

  return (
    <View testID="plan-locked-screen" className="flex-1 bg-linen">
      <BackHeader testID="plan-locked-back-button" />
      <View className="px-7 pt-6">
        <Text className="text-2xl font-black leading-9 text-ink">
          {plan?.title ?? ""}
        </Text>
      </View>

      <View className="mx-6 mt-4 flex-row items-start gap-[11px] rounded-field border border-honey-border bg-honey-surface px-4 py-[15px]">
        <Icon name="lock" size={20} color={palette.honey.DEFAULT} />
        <View className="flex-1 gap-[3px]">
          <Text className="text-sm font-medium text-honey-text">
            {lockedByName} が編集しています
          </Text>
          <Text className="text-xs font-medium leading-5 text-honey-soft">
            すこし待ってから、もう一度プランを開いてください。
          </Text>
        </View>
      </View>

      <View className="mx-6 mt-3.5 overflow-hidden rounded-card bg-paper opacity-60 shadow-card">
        {plan?.date ? (
          <View className="flex-row items-center justify-between border-b border-sand px-[18px] py-[15px]">
            <Text className="text-xs font-bold tracking-[1px] text-stone">
              日にち
            </Text>
            <Text className="text-[15px] font-medium text-ink">
              {formatDateLong(plan.date, plan.time)}
            </Text>
          </View>
        ) : null}
        {plan?.memo ? (
          <View className="gap-[5px] px-[18px] py-[15px]">
            <Text className="text-xs font-bold tracking-[1px] text-stone">
              メモ
            </Text>
            <Text className="text-sm font-medium leading-6 text-ink">
              {plan.memo}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="flex-1" />

      <View className="px-6" style={{ paddingBottom: insets.bottom + 24 }}>
        <View className="h-[54px] flex-row items-center justify-center gap-2 rounded-button bg-honey-muted">
          <Icon name="lock" size={16} color={palette.stone} />
          <Text className="text-base font-medium text-stone">
            編集できません
          </Text>
        </View>
      </View>
    </View>
  );
}
