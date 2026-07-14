// TanStack Query の queryKey 規約（adr/0003）。無効化・再取得はここを基準にする。
export const notificationKeys = {
  all: ["notifications"] as const,
  permission: ["notifications", "permission"] as const,
};
