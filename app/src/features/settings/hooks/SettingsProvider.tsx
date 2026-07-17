import { createContext, type ReactNode, useContext, useMemo } from "react";

import type { BugReportRepository } from "../data/bugReportRepository";
import type { FileShareRepository } from "../data/fileShareRepository";
import type { SettingsRepository } from "../data/settingsRepository";

type SettingsContextValue = {
  settingsRepository: SettingsRepository;
  fileShareRepository: FileShareRepository;
  bugReportRepository: BugReportRepository;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

// Repository を注入で受け取る合成ルート（adr/0003）。
export function SettingsProvider({
  settingsRepository,
  fileShareRepository,
  bugReportRepository,
  children,
}: SettingsContextValue & { children: ReactNode }) {
  const value = useMemo(
    () => ({ settingsRepository, fileShareRepository, bugReportRepository }),
    [settingsRepository, fileShareRepository, bugReportRepository],
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
