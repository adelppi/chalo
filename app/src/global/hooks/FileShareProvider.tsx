import { createContext, type ReactNode, useContext, useMemo } from "react";

import type { FileShareRepository } from "@global/@types/fileShareRepository";

const FileShareContext = createContext<FileShareRepository | null>(null);

// Repository を注入で受け取る合成ルート（adr/0003）。settings・pairing の両方から
// 使うため、単一 feature の Provider には束ねず global に置く（Issue #64）。
export function FileShareProvider({
  fileShareRepository,
  children,
}: {
  fileShareRepository: FileShareRepository;
  children: ReactNode;
}) {
  const value = useMemo(() => fileShareRepository, [fileShareRepository]);
  return (
    <FileShareContext.Provider value={value}>
      {children}
    </FileShareContext.Provider>
  );
}

export function useFileShareContext(): FileShareRepository {
  const context = useContext(FileShareContext);
  if (!context) {
    throw new Error(
      "useFileShareContext は FileShareProvider の内側で使ってください。",
    );
  }
  return context;
}
