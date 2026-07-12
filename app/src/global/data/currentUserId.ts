import { supabase } from "@global/lib/supabase";

// サインイン中ユーザーの id（= profiles.id）。RLS の対象になる書き込みや
// 自分の行の読み出しで使う。セッションは端末キャッシュから読むため通信しない。
export async function currentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  const userId = data.session?.user.id;
  if (!userId) {
    throw new Error("サインインしていません。");
  }
  return userId;
}
