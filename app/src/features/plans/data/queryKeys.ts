// TanStack Query の queryKey 規約（adr/0003）。無効化・再取得はここを基準にする。
export const planKeys = {
  all: ["plans"] as const,
  detail: (id: string) => ["plans", id] as const,
};
