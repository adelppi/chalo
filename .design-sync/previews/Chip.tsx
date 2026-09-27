import { Chip } from "chalo-ds";

// 文言・組み合わせは実際のアプリ（app/src/features）での使い方どおり。

// プラン一覧の行（C-1a）：日時は camel、期限は blush。
export const InList = () => (
  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
    <Chip icon="calendar" label="11月21日（土）10:00" />
    <Chip icon="clock" label="10/31 まで" tone="blush" />
  </div>
);

// 「つぎの予定」カード（C-1a）の暗い面。
export const OnDark = () => (
  <div style={{ background: "#261f19", padding: 20, borderRadius: 22, display: "flex", gap: 8 }}>
    <Chip icon="calendar" label="10月17日（土）" tone="on-dark" />
  </div>
);

// プラン詳細（D-1）は md、招待コード（B-2）の残り時間は blush。
export const Sizes = () => (
  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
    <Chip icon="calendar" label="11月21日（土）10:00" size="md" />
    <Chip icon="clock" label="あと 24 時間 つかえます" tone="blush" />
  </div>
);
