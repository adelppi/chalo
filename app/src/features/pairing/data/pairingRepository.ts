import type { InviteCode, PairState, RedeemErrorReason } from "../model/types";

// ペアリングの Repository interface（adr/0003）。
// 実装（モック段階では in-memory フェイク、将来は Supabase）は global/data に置く。

/** 招待コード入力の失敗（F-3）。reason でメッセージを出し分ける */
export class PairingCodeError extends Error {
  readonly reason: RedeemErrorReason;

  constructor(reason: RedeemErrorReason) {
    super(`招待コードエラー: ${reason}`);
    this.name = "PairingCodeError";
    this.reason = reason;
  }
}

export interface PairingRepository {
  getPairState(): Promise<PairState>;

  /** 招待コードを発行する。再発行すると前のコードは失効する（domain/pairing.md） */
  issueInviteCode(): Promise<InviteCode>;

  /** 相手のコードを入力してペア成立。失敗は PairingCodeError */
  redeemInviteCode(code: string): Promise<{ partnerName: string }>;
}
