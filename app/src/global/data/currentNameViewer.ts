import { supabase } from "@global/lib/supabase";
import type { NameViewer } from "@global/utils/personName";

import { currentUserId } from "./currentUserId";

/**
 * 名前解決の視点（自分の id と、自分が設定した相手のよびかた）を取得する。
 * 相手の名前は「よびかたがあればそれ、無ければ相手の表示名」で解決するため、
 * 相手の名前を返す Repository はこれを併せて読む（domain/pairing.md・adr/0003）。
 *
 * キャッシュは持たない。よびかたを変えた直後の表示更新は、呼び出し側のクエリ
 * 無効化（useUpdatePartnerNickname）に任せる。
 */
export async function currentNameViewer(): Promise<NameViewer> {
  const viewerId = await currentUserId();
  const { data, error } = await supabase
    .from("profiles")
    .select("partner_nickname")
    .eq("id", viewerId)
    .single();
  if (error) {
    throw error;
  }
  return { viewerId, partnerNickname: data.partner_nickname };
}
