import { resolvePartnerName } from "@global/utils/personName";

import type { InviteCode, PairState } from "./types";

// ペア状態の導出。純粋関数（adr/0014）。

/** getPairState の入力（profiles・invites の取得結果の要約） */
export type PairStateSource = {
  /** 自分の表示名 */
  myName: string;
  /** 自分の pair_id（未ペアなら null） */
  pairId: string | null;
  /** 相手の表示名（原名）。同じ pair_id の相手の行が取得できなければ null */
  partnerDisplayName: string | null;
  /** 自分が設定した相手のよびかた（未設定なら null） */
  partnerNickname: string | null;
  /** 発行済みの有効な招待コード（ソロ時のみ意味を持つ） */
  inviteCode: InviteCode | null;
};

/**
 * プロフィール取得結果から PairState を導出する。
 * 自分の pair_id はあるのに相手の行が無い＝パートナーがアカウント削除済み（partner-left）。
 * 検知は起動・フォアグラウンド復帰時の再取得に乗せる（adr/0004。リアルタイム購読は使わない）。
 * 相手の名前は表示用（よびかた優先）と原名の両方を返す（domain/pairing.md「相手の名前の表示」）。
 */
export function derivePairState(source: PairStateSource): PairState {
  if (source.pairId === null) {
    return { status: "solo", inviteCode: source.inviteCode };
  }
  if (source.partnerDisplayName === null) {
    return { status: "partner-left" };
  }
  return {
    status: "paired",
    myName: source.myName,
    partnerName: resolvePartnerName(
      source.partnerNickname,
      source.partnerDisplayName,
    ),
    partnerDisplayName: source.partnerDisplayName,
  };
}
