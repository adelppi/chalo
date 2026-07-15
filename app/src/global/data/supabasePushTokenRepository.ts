import type { PushTokenRepository } from "@features/notifications";
import { supabase } from "@global/lib/supabase";

// push_tokens の Supabase 実装（adr/0003）。同じ端末（同じトークン）の再登録は
// upsert で1行に保つ（data-model.md「push_tokens」）。

export const supabasePushTokenRepository: PushTokenRepository = {
  async upsertToken(profileId: string, expoPushToken: string): Promise<void> {
    const { error } = await supabase.from("push_tokens").upsert(
      {
        profile_id: profileId,
        expo_push_token: expoPushToken,
      },
      { onConflict: "profile_id,expo_push_token" },
    );
    if (error) {
      throw error;
    }
  },
};
