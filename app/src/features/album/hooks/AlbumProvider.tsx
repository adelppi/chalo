import { createContext, type ReactNode, useContext, useMemo } from "react";

import type { PhotoLibraryRepository } from "../data/photoLibraryRepository";

type AlbumContextValue = {
  photoLibraryRepository: PhotoLibraryRepository;
};

const AlbumContext = createContext<AlbumContextValue | null>(null);

// Repository を注入で受け取る合成ルート（adr/0003）。
export function AlbumProvider({
  photoLibraryRepository,
  children,
}: AlbumContextValue & { children: ReactNode }) {
  const value = useMemo(
    () => ({ photoLibraryRepository }),
    [photoLibraryRepository],
  );
  return (
    <AlbumContext.Provider value={value}>{children}</AlbumContext.Provider>
  );
}

export function useAlbumContext(): AlbumContextValue {
  const context = useContext(AlbumContext);
  if (!context) {
    throw new Error(
      "useAlbumContext は AlbumProvider の内側で使ってください。",
    );
  }
  return context;
}
