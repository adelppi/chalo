// plans feature の公開 API（バレル）。外部はここ経由でのみ参照する（adr/0015）。

export { DoneListScreen } from "./components/DoneListScreen";
export { HomeScreen } from "./components/HomeScreen";
export { PlanClosedScreen } from "./components/PlanClosedScreen";
export { PlanDetailScreen } from "./components/PlanDetailScreen";
export { PlanFormScreen } from "./components/PlanFormScreen";

export { PlansProvider } from "./hooks/PlansProvider";
export { usePlans } from "./hooks/usePlans";

// データ契約（Repository interface とドメイン型）。global/data のフェイク実装が参照する。
export type { PlanRepository } from "./data";
// 他 feature からの無効化用（相手のよびかた変更で作成者名を読み直す。adr/0003）。
export { planKeys } from "./data/queryKeys";
export { buildPlansExportText, EXPORT_FILE_NAME } from "./model/exportText";
export { countPlanStatuses } from "./model/sections";
export type { Plan, PlanDraft, PlanStatus } from "./model/types";
