import { useLocalSearchParams } from "expo-router";

import { PlanClosedScreen } from "@features/plans";

// おしまい完了のお祝い（D-3。フェードの全画面）。
export default function PlanClosedRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PlanClosedScreen id={id} />;
}
