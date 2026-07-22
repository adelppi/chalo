import { createContext, type ReactNode, useContext, useMemo } from "react";

import type { BugReportRepository } from "../data/bugReportRepository";
import type { SettingsRepository } from "../data/settingsRepository";

type SettingsContextValue = {
  settingsRepository: SettingsRepository;
  bugReportRepository: BugReportRepository;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

// Repository を注入で受け取る合成ルート（adr/0003）。
// fileShareRepository は settings・pairing の両方から使うため global の
// FileShareProvider が担う（Issue #64）。
export function SettingsProvider({
  settingsRepository,
  bugReportRepository,
  children,
}: SettingsContextValue & { children: ReactNode }) {
  const value = useMemo(
    () => ({ settingsRepository, bugReportRepository }),
    [settingsRepository, bugReportRepository],
  );
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error(
      "useSettingsContext は SettingsProvider の内側で使ってください。",
    );
  }
  return context;
}
