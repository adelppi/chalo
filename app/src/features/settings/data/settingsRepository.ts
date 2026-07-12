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
}
