// settings feature の公開 API（バレル）。外部はここ経由でのみ参照する（adr/0015）。

export { ExportPlansDialog } from "./components/ExportPlansDialog";
export { SettingsScreen } from "./components/SettingsScreen";
export { SettingsProvider } from "./hooks/SettingsProvider";

// データ契約（Repository interface とドメイン型）。global/data のフェイク実装が参照する。
export type {
  FileShareRepository,
  ProfileSettings,
  SettingsRepository,
} from "./data";
