import type { ProfileSettings, SettingsRepository } from "@features/settings";
import { supabase } from "@global/lib/supabase";

import { currentUserId } from "./currentUserId";

export const supabaseSettingsRepository: SettingsRepository = {
  async getProfileSettings(): Promise<ProfileSettings> {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from("profiles")
      .select("display_name, partner_nickname")
      .eq("id", userId)
      .single();
    if (error) {
      throw error;
    }
    return {
      displayName: data.display_name,
      partnerNickname: data.partner_nickname,
    };
  },

  async updateDisplayName(displayName: string): Promise<void> {
    const userId = await currentUserId();
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", userId);
    if (error) {
      throw error;
    }
  },

  async updatePartnerNickname(partnerNickname: string): Promise<void> {
    const userId = await currentUserId();
    const { error } = await supabase
      .from("profiles")
      .update({ partner_nickname: partnerNickname })
      .eq("id", userId);
    if (error) {
      throw error;
    }
  },
};
