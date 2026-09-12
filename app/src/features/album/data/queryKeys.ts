// TanStack Query の queryKey 規約（adr/0003）。
export const albumKeys = {
  all: ["album"] as const,
  permission: ["album", "permission"] as const,
  /** 区間はミリ秒で持つ。日付が同じなら同じキーになる */
  photos: (from: number, to: number) => ["album", "photos", from, to] as const,
};
