import type { ProfileSettings, SettingsRepository } from "@features/settings";

// SettingsRepository の in-memory フェイク実装（Issue #14：モック用）。

const LATENCY_MS = 250;

function sleep(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}

const profile: ProfileSettings = {
  displayName: "ゆい",
  partnerNickname: "そうた",
};

export const fakeSettingsRepository: SettingsRepository = {
  async getProfileSettings() {
    await sleep();
    return { ...profile };
  },
};
