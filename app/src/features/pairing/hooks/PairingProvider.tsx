import { createContext, type ReactNode, useContext, useMemo } from "react";

import type { PairingRepository } from "../data/pairingRepository";

type PairingContextValue = {
  pairingRepository: PairingRepository;
};

const PairingContext = createContext<PairingContextValue | null>(null);

// Repository を注入で受け取る合成ルート（adr/0003）。
export function PairingProvider({
  pairingRepository,
  children,
}: PairingContextValue & { children: ReactNode }) {
  const value = useMemo(() => ({ pairingRepository }), [pairingRepository]);
  return (
    <PairingContext.Provider value={value}>{children}</PairingContext.Provider>
  );
}

export function usePairingContext(): PairingContextValue {
  const context = useContext(PairingContext);
  if (!context) {
    throw new Error(
      "usePairingContext は PairingProvider の内側で使ってください。",
    );
  }
  return context;
}
