import type { ProfileRepository, SignInResult } from "../data";
import {
  formatAppleFullName,
  getDeviceTimezone,
  resolveDisplayName,
} from "../model";

// サインイン結果から表示名を確定し、profiles 行が無ければ作成する共通処理。
// Google / Apple どちらのサインインからも使う。
export async function completeSignIn(
  result: SignInResult,
  profileRepository: ProfileRepository,
): Promise<void> {
  const { session, identity } = result;

  const nameHint =
    identity.fullName ?? formatAppleFullName(identity.appleFullName);
  const displayName = resolveDisplayName({ nameHint, email: identity.email });

  await profileRepository.ensureProfile({
    userId: session.user.id,
    displayName,
    avatarUrl: identity.avatarUrl,
    timezone: getDeviceTimezone(),
  });
}
