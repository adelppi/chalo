import { createContext, type ReactNode, useContext, useMemo } from "react";

import type { OnboardingRepository } from "../data/onboardingRepository";

type OnboardingContextValue = {
  onboardingRepository: OnboardingRepository;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

// Repository を注入で受け取る合成ルート（adr/0003）。
export function OnboardingProvider({
  onboardingRepository,
  children,
}: OnboardingContextValue & { children: ReactNode }) {
  const value = useMemo(
    () => ({ onboardingRepository }),
    [onboardingRepository],
  );
  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboardingContext(): OnboardingContextValue {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error(
      "useOnboardingContext は OnboardingProvider の内側で使ってください。",
    );
  }
  return context;
}
