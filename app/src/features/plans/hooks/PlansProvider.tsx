import { createContext, type ReactNode, useContext, useMemo } from "react";

import type { PlanRepository } from "../data/planRepository";

type PlansContextValue = {
  planRepository: PlanRepository;
};

const PlansContext = createContext<PlansContextValue | null>(null);

// Repository を注入で受け取る合成ルート（adr/0003・auth の AuthProvider と同じ型）。
export function PlansProvider({
  planRepository,
  children,
}: PlansContextValue & { children: ReactNode }) {
  const value = useMemo(() => ({ planRepository }), [planRepository]);
  return (
    <PlansContext.Provider value={value}>{children}</PlansContext.Provider>
  );
}

export function usePlansContext(): PlansContextValue {
  const context = useContext(PlansContext);
  if (!context) {
    throw new Error(
      "usePlansContext は PlansProvider の内側で使ってください。",
    );
  }
  return context;
}
