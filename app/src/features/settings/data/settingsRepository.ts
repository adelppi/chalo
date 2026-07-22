// 設定画面のプロフィール表示（docs/data-model.md profiles の一部）。

export type ProfileSettings = {
  /** あなたの名前（profiles.display_name） */
  displayName: string;
  /** 相手のよびかた（profiles.partner_nickname。未設定なら null） */
  partnerNickname: string | null;
};

// 設定の Repository interface（adr/0003）。
// 実装（モック段階では in-memory フェイク、将来は Supabase）は global/data に置く。
export interface SettingsRepository {
  getProfileSettings(): Promise<ProfileSettings>;

  /** 「あなたの名前」を更新する（本人のみ write。data-model.md profiles） */
  updateDisplayName(displayName: string): Promise<void>;

  /**
   * 「相手のよびかた」を更新する（本人のみ write。data-model.md profiles）。
   * null を渡すと未設定に戻り、以後は相手の表示名で表示される（domain/pairing.md）。
   */
  updatePartnerNickname(partnerNickname: string | null): Promise<void>;
}
