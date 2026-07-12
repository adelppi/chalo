import { Pressable, Text } from "react-native";

import { Chip } from "@global/components/ui";

import { formatDateLong, formatDeadlineLabel } from "../model/format";
import type { Plan } from "../model/types";

type PlanListRowProps = {
  plan: Plan;
  onPress: () => void;
  /** 最終行以外は下線を引く */
  showSeparator: boolean;
};

// ホーム一覧の1行（C-1b）。予定は日付チップ、いつかいくは期限チップ（あれば）。
export function PlanListRow({
  plan,
  onPress,
  showSeparator,
}: PlanListRowProps) {
  return (
    <Pressable
      testID={`plans-list-item-${plan.id}`}
      onPress={onPress}
      className={`flex-row items-center justify-between px-[18px] py-4 active:opacity-70 ${
        showSeparator ? "border-b border-sand" : ""
      }`}
    >
      <Text
        className="mr-2 flex-1 text-[17px] font-medium text-ink"
        numberOfLines={1}
      >
        {plan.title}
      </Text>
      {plan.date ? (
        <Chip icon="calendar" label={formatDateLong(plan.date, plan.time)} />
      ) : plan.deadline ? (
        <Chip
          icon="clock"
          tone="blush"
          label={formatDeadlineLabel(plan.deadline)}
        />
      ) : null}
    </Pressable>
  );
}
