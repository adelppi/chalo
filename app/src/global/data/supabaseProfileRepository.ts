import type {
  EnsureProfileInput,
  Profile,
  ProfileRepository,
} from "@features/auth";
import type { Database } from "@global/lib/supabase";
import { supabase } from "@global/lib/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    partnerNickname: row.partner_nickname,
    pairId: row.pair_id,
    timezone: row.timezone,
    createdAt: row.created_at,
  };
}

async function getMyProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data ? toProfile(data) : null;
}

export const supabaseProfileRepository: ProfileRepository = {
  getMyProfile,

  async ensureProfile(input: EnsureProfileInput): Promise<Profile> {
    const existing = await getMyProfile(input.userId);
    if (existing) {
      return existing;
    }

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: input.userId,
        display_name: input.displayName,
        avatar_url: input.avatarUrl,
        timezone: input.timezone,
      })
      .select("*")
      .single();

    if (error) {
      // 競合（別経路で先に作成された等）の可能性があるため取得し直す。
      const fallback = await getMyProfile(input.userId);
      if (fallback) {
        return fallback;
      }
      throw error;
    }

    return toProfile(data);
  },
};
