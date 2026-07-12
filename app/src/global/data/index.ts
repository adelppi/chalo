export { supabaseAuthRepository } from "./supabaseAuthRepository";
export { supabaseProfileRepository } from "./supabaseProfileRepository";

// Issue #14：画面モック用の in-memory フェイク実装。
// Supabase 実装ができたら合成ルート（src/app/_layout.tsx）で差し替える。
export { fakePairingRepository } from "./fakePairingRepository";
export { fakePlanRepository } from "./fakePlanRepository";
export { fakeSettingsRepository } from "./fakeSettingsRepository";
