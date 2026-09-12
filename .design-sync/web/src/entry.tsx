// chalo デザインシステムの Web 向け公開エントリ（design-sync 専用）。
// 実装は app/src/global/components の実コードをそのまま再エクスポートしている。
export { Avatar } from "@global/components/ui/Avatar";
export { Button } from "@global/components/ui/Button";
export { Chip } from "@global/components/ui/Chip";
export { Dialog } from "@global/components/ui/Dialog";
export { Icon } from "@global/components/ui/Icon";
export { Sheet } from "@global/components/ui/Sheet";
export { IconButton } from "@global/components/ui/IconButton";
export { ChaloFace, PawPrint } from "@global/components/shared/ChaloMascot";
export { ChaloTabBar } from "@global/components/shared/ChaloTabBar";

// プレビュー用のコンテキスト。ChaloTabBar が useSafeAreaInsets を読むため、
// design-sync の cfg.provider から値を差し込めるようにエクスポートする。
// コンポーネント一覧からは componentSrcMap で除外している。
export { SafeAreaInsetsContext } from "react-native-safe-area-context";
