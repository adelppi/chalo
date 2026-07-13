import { useLocalSearchParams } from "expo-router";

import { PlanLockedScreen } from "@features/plans";

// 編集ロック中の競合（F-9）。編集ボタン押下時に相手のロックを検出したら遷移する。
export default function PlanLockedRoute() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  return <PlanLockedScreen id={id} lockedByName={name ?? "相手"} />;
}
