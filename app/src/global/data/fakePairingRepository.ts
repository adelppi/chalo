import {
  PairingCodeError,
  type InviteCode,
  type PairingRepository,
  type PairState,
} from "@features/pairing";

// PairingRepository の in-memory フェイク実装（Issue #14：モック用）。
// 初期状態はソロ（E-1b）で、コードを入力するとペア成立（E-1）に切り替わる。
//
// デモ用の固定ルール：
// - 自分の発行済みコード → own-code エラー
// - "483903"（デザイン B-4 の例）→ not-found エラー
// - "000000" → expired エラー
// - ペア成立後の入力 → already-paired エラー
// - それ以外の6桁 → 成立（相手は「そうた」）

const LATENCY_MS = 250;
const MY_NAME = "ゆい";
const PARTNER_NAME = "そうた";
const INITIAL_CODE = "483902";
const CODE_TTL_HOURS = 24;

function sleep(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}

function expiresFromNow(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

function randomCode(): string {
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
}

function createFakePairingRepository(): PairingRepository {
  // E-1b の見本どおり、発行済みコード（残り23時間）を持った状態から始める
  let paired = false;
  let inviteCode: InviteCode | null = {
    code: INITIAL_CODE,
    expiresAt: expiresFromNow(CODE_TTL_HOURS - 1),
  };

  return {
    async getPairState(): Promise<PairState> {
      await sleep();
      if (paired) {
        return { status: "paired", myName: MY_NAME, partnerName: PARTNER_NAME };
      }
      return { status: "solo", inviteCode };
    },

    async issueInviteCode(): Promise<InviteCode> {
      await sleep();
      inviteCode = {
        code: randomCode(),
        expiresAt: expiresFromNow(CODE_TTL_HOURS),
      };
      return { ...inviteCode };
    },

    async redeemInviteCode(code: string) {
      await sleep();
      if (paired) {
        throw new PairingCodeError("already-paired");
      }
      if (inviteCode && code === inviteCode.code) {
        throw new PairingCodeError("own-code");
      }
      if (code === "483903") {
        throw new PairingCodeError("not-found");
      }
      if (code === "000000") {
        throw new PairingCodeError("expired");
      }
      paired = true;
      inviteCode = null;
      return { partnerName: PARTNER_NAME };
    },
  };
}

export const fakePairingRepository: PairingRepository =
  createFakePairingRepository();
