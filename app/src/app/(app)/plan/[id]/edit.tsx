import { useLocalSearchParams } from "expo-router";

import { PlanFormScreen } from "@features/plans";

// プランを編集（D-2。モーダル表示）。
export default function PlanEditRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PlanFormScreen mode="edit" id={id} />;
}
