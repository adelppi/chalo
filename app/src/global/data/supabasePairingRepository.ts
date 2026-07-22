import {
  derivePairState,
  PairingCodeError,
  mapRedeemErrorReason,
  type InviteCode,
  type PairingRepository,
  type PairState,
} from "@features/pairing";
import { supabase } from "@global/lib/supabase";

import { currentUserId } from "./currentUserId";

const CODE_LENGTH = 6;
const CODE_TTL_HOURS = 24;
const MAX_ISSUE_ATTEMPTS = 5;
// Postgres の一意制約違反（6桁コードの衝突。再生成して retry する）。
const UNIQUE_VIOLATION_CODE = "23505";

function randomCode(): string {
  return String(Math.floor(Math.random() * 1_000_000)).padStart(
    CODE_LENGTH,
    "0",
  );
}

function expiresFromNow(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

export const supabasePairingRepository: PairingRepository = {
  async getPairState(): Promise<PairState> {
    const userId = await currentUserId();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("display_name, pair_id, partner_nickname")
      .eq("id", userId)
      .single();
    if (profileError) {
      throw profileError;
    }

    if (profile.pair_id) {
      // 相手の profiles 行は profiles_select_partner ポリシー（同じ pair_id）で読める。
      // pair_id があるのに行が無い＝パートナーがアカウント削除済み（partner-left。adr/0018）。
      const { data: partner, error: partnerError } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("pair_id", profile.pair_id)
        .neq("id", userId)
        .maybeSingle();
      if (partnerError) {
        throw partnerError;
      }
      return derivePairState({
        myName: profile.display_name,
        pairId: profile.pair_id,
        partnerDisplayName: partner?.display_name ?? null,
        partnerNickname: profile.partner_nickname,
        inviteCode: null,
      });
    }

    // ソロ：有効な未使用コードは常に1つ（issueInviteCode が再発行時に旧コードを消す）。
    const { data: invite, error: inviteError } = await supabase
      .from("invites")
      .select("code, expires_at")
      .eq("inviter_id", userId)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (inviteError) {
      throw inviteError;
    }

    return derivePairState({
      myName: profile.display_name,
      pairId: null,
      partnerDisplayName: null,
      partnerNickname: profile.partner_nickname,
      inviteCode: invite
        ? { code: invite.code, expiresAt: invite.expires_at }
        : null,
    });
  },

  async issueInviteCode(): Promise<InviteCode> {
    const userId = await currentUserId();

    // 再発行すると前のコードは失効する（domain/pairing.md）。未使用の旧コードを先に消す。
    const { error: deleteError } = await supabase
      .from("invites")
      .delete()
      .eq("inviter_id", userId)
      .is("used_at", null);
    if (deleteError) {
      throw deleteError;
    }

    for (let attempt = 0; attempt < MAX_ISSUE_ATTEMPTS; attempt++) {
      const code = randomCode();
      const expiresAt = expiresFromNow(CODE_TTL_HOURS);
      const { error } = await supabase
        .from("invites")
        .insert({ code, inviter_id: userId, expires_at: expiresAt });
      if (!error) {
        return { code, expiresAt };
      }
      if (error.code !== UNIQUE_VIOLATION_CODE) {
        throw error;
      }
      // コード衝突。ループして生成し直す。
    }
    throw new Error(
      "招待コードの発行に失敗しました。もういちどためしてください。",
    );
  },

  async redeemInviteCode(code: string): Promise<{ partnerName: string }> {
    // 成立処理（コード検証・pairs 作成・両者への pair_id 付与・ソロプラン合流）は
    // redeem_invite_code() の1トランザクションで行う（domain/pairing.md・adr/0017）。
    const { data, error } = await supabase.rpc("redeem_invite_code", {
      p_code: code,
    });
    if (error) {
      const reason = mapRedeemErrorReason(error.message);
      if (reason) {
        throw new PairingCodeError(reason);
      }
      throw error;
    }
    const partner = data?.[0];
    return { partnerName: partner?.partner_name ?? "" };
  },
};
