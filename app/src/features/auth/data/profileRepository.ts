import type { EnsureProfileInput, Profile } from "./types";

// プロフィールの Repository interface。サインイン成功時の profiles 行の用意に使う。
export interface ProfileRepository {
  // 自分のプロフィールを取得する（なければ null）。
  getMyProfile(userId: string): Promise<Profile | null>;

  // プロフィール行が無ければ作成して返す。既にあれば既存を返す（冪等）。
  ensureProfile(input: EnsureProfileInput): Promise<Profile>;
}
