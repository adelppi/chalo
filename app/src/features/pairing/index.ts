// pairing feature の公開 API（バレル）。外部はここ経由でのみ参照する（adr/0015）。

export { EnterCodeScreen } from "./components/EnterCodeScreen";
export { InviteCodeScreen } from "./components/InviteCodeScreen";
export { NotificationPrimingScreen } from "./components/NotificationPrimingScreen";
export { PairingStartScreen } from "./components/PairingStartScreen";
export { PairSuccessScreen } from "./components/PairSuccessScreen";
export { PartnerLeftScreen } from "./components/PartnerLeftScreen";

export { PairingProvider } from "./hooks/PairingProvider";
export { usePairState } from "./hooks/usePairState";

export { pairingKeys } from "./data/queryKeys";

export { formatRemainingLabel, mapRedeemErrorReason } from "./model/invite";
export { derivePairState, type PairStateSource } from "./model/pairState";

// データ契約（Repository interface とドメイン型）。global/data のフェイク実装が参照する。
export { PairingCodeError, type PairingRepository } from "./data";
export type { InviteCode, PairState, RedeemErrorReason } from "./model/types";
