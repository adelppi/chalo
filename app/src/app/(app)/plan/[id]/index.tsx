import { useLocalSearchParams } from "expo-router";

import { PlanDetailScreen } from "@features/plans";

// プラン詳細（D-1。通知ディープリンク先。削除済みなら F-10）。
export default function PlanDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PlanDetailScreen id={id} />;
}
