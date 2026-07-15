// ペアリングのドメイン型（docs/domain/pairing.md・docs/data-model.md invites）。

export type InviteCode = {
  /** 6桁の数字 */
  code: string;
  /** 有効期限（ISO 8601。発行から24時間） */
  expiresAt: string;
};

export type PairState =
  | {
      status: "solo";
      /** 発行済みの招待コード（未発行なら null） */
      inviteCode: InviteCode | null;
    }
  | {
      status: "paired";
      /** 自分の表示名（B-5 の名前ピルに使う） */
      myName: string;
      partnerName: string;
    }
  | {
      /** パートナーがアカウント削除済み。全画面ロックに入る（domain/pairing.md「残った側（B）の状態」） */
      status: "partner-left";
    };

/** 招待コード入力のエラー種別（F-3） */
export type RedeemErrorReason =
  "not-found" | "expired" | "own-code" | "already-paired";
