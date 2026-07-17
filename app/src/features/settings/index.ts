// settings feature の公開 API（バレル）。外部はここ経由でのみ参照する（adr/0015）。

export { ExportPlansDialog } from "./components/ExportPlansDialog";
export { SettingsScreen } from "./components/SettingsScreen";
export { SettingsProvider } from "./hooks/SettingsProvider";
export { useProfileSettings } from "./hooks/useProfileSettings";
export {
  useUpdateDisplayName,
  useUpdatePartnerNickname,
} from "./hooks/useProfileMutations";

// データ契約（Repository interface とドメイン型）。global/data のフェイク実装が参照する。
export type {
  BugReportRepository,
  FileShareRepository,
  ProfileSettings,
  SettingsRepository,
} from "./data";
export type { BugReportDraft } from "./model/bugReport";

// 名前・相手のよびかたのバリデーション（純粋関数。adr/0014）。onboarding の A3 とも共有する。
export {
  PROFILE_NAME_MAX_LENGTH,
  profileNameErrorMessage,
  validateProfileName,
} from "./model/profileValidation";
export type { ProfileNameValidation } from "./model/profileValidation";
