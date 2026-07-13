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
};
