import "react-native-url-polyfill/auto";

import { createClient } from "@supabase/supabase-js";
import { AppState } from "react-native";

import type { Database } from "./database.types";
import { LargeSecureStore } from "./largeSecureStore";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY が設定されていません。.env.local を確認してください。",
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // セッションは暗号化して端末に永続化する（adr/0003・Issue #8）。
    storage: new LargeSecureStore(),
    autoRefreshToken: true,
    persistSession: true,
    // iOS のみ・OIDC のみのため URL からのセッション検出は不要。
    detectSessionInUrl: false,
  },
});

// アプリが前面にある間だけトークンの自動更新を回す（Supabase 公式の React Native 手順）。
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
