import AsyncStorage from "@react-native-async-storage/async-storage";

import type { OnboardingRepository } from "@features/onboarding";
import {
  parseOnboardingProgress,
  serializeOnboardingProgress,
} from "@features/onboarding";

import { currentUserId } from "./currentUserId";

// オンボーディング進捗の AsyncStorage 実装。userId 単位で保持し、
// 端末に複数アカウントが行き来しても互いの進捗を混同しない（domain/onboarding.md）。
const keyFor = (userId: string) => `onboarding.progress.${userId}`;

async function readProgress(userId: string) {
  return parseOnboardingProgress(await AsyncStorage.getItem(keyFor(userId)));
}

export const asyncStorageOnboardingRepository: OnboardingRepository = {
  async getProgress() {
    const userId = await currentUserId();
    return readProgress(userId);
  },

  async confirmName(): Promise<void> {
    const userId = await currentUserId();
    const current = await readProgress(userId);
    await AsyncStorage.setItem(
      keyFor(userId),
      serializeOnboardingProgress({ ...current, nameConfirmed: true }),
    );
  },

  async complete(): Promise<void> {
    const userId = await currentUserId();
    const current = await readProgress(userId);
    await AsyncStorage.setItem(
      keyFor(userId),
      serializeOnboardingProgress({ ...current, complete: true }),
    );
  },
};
