// onboarding feature の公開 API（バレル）。外部はここ経由でのみ参照する（adr/0015）。

export { NameConfirmScreen } from "./components/NameConfirmScreen";

export { OnboardingProvider } from "./hooks/OnboardingProvider";
export { useOnboardingProgress } from "./hooks/useOnboardingProgress";
export {
  useCompleteOnboarding,
  useConfirmName,
} from "./hooks/useOnboardingMutations";

// データ契約（Repository interface とドメイン型）。global/data の実装が参照する。
export type { OnboardingRepository } from "./data";
export { onboardingKeys } from "./data";

// ルーティングのガードに使う純粋関数（adr/0014）。global/data の AsyncStorage 実装も参照する。
export {
  needsOnboarding,
  parseOnboardingProgress,
  serializeOnboardingProgress,
} from "./model/progress";
export type { OnboardingProgress } from "./model/progress";
