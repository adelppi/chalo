import { useQuery } from "@tanstack/react-query";

import { onboardingKeys } from "../data/queryKeys";
import { useOnboardingContext } from "./OnboardingProvider";

/** オンボーディング進捗（端末ローカル）。ルーティングのガードに使う */
export function useOnboardingProgress() {
  const { onboardingRepository } = useOnboardingContext();
  return useQuery({
    queryKey: onboardingKeys.progress,
    queryFn: () => onboardingRepository.getProgress(),
  });
}
