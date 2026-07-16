import { createContext, type ReactNode, useContext, useMemo } from "react";

import type { FileShareRepository } from "../data/fileShareRepository";
import type { SettingsRepository } from "../data/settingsRepository";

type SettingsContextValue = {
  settingsRepository: SettingsRepository;
  fileShareRepository: FileShareRepository;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

// Repository を注入で受け取る合成ルート（adr/0003）。
export function SettingsProvider({
  settingsRepository,
  fileShareRepository,
  children,
}: SettingsContextValue & { children: ReactNode }) {
  const value = useMemo(
    () => ({ settingsRepository, fileShareRepository }),
    [settingsRepository, fileShareRepository],
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
