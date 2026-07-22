// 相手の名前の表示規則（docs/domain/pairing.md「相手の名前の表示」）。純粋関数（adr/0014）。
//
// 「相手のよびかた」（profiles.partner_nickname）は各自の見え方であり、相手の画面は変わらない。
// そのため名前の解決には「だれが見ているか」の視点が要る。解決はデータ層で行い、
// 画面は受け取った名前をそのまま表示する（adr/0003）。

/** 名前を見ている人。chalo は1対1のため「自分でなければ相手」で判定できる */
export type NameViewer = {
  /** 見ている人（自分）の profile id */
  viewerId: string;
  /** 自分が設定した相手のよびかた（未設定なら null） */
  partnerNickname: string | null;
};

/** 相手の名前。よびかたがあればそれ、無ければ相手の表示名 */
export function resolvePartnerName(
  partnerNickname: string | null,
  partnerDisplayName: string,
): string {
  return partnerNickname?.trim() || partnerDisplayName;
}

/**
 * ペアのだれか（プランの作成者・ロック保持者など）の名前を、見ている人の視点で解決する。
 * 自分にはよびかたを適用しない（自分は常に表示名）。
 * 表示名が読めなかった場合（RLS で弾かれた等）は null を返し、フォールバックは呼び出し側に委ねる。
 */
export function resolvePersonName(
  person: { id: string; displayName: string | null },
  viewer: NameViewer,
): string | null {
  if (person.id === viewer.viewerId) {
    return person.displayName;
  }
  return viewer.partnerNickname?.trim() || person.displayName;
}
