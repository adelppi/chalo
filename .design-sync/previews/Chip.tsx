import { Chip } from "chalo-ds";

export const Tones = () => (
  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
    <Chip icon="calendar" label="3月14日（金）18:00" tone="camel" />
    <Chip icon="clock" label="あと5日" tone="blush" />
    <Chip icon="pin" label="箱根" tone="blush" />
  </div>
);

export const OnDark = () => (
  <div style={{ background: "#261f19", padding: 20, borderRadius: 20, display: "flex", gap: 8 }}>
    <Chip icon="calendar" label="3月14日（金）" tone="on-dark" />
    <Chip icon="pin" label="鎌倉" tone="on-dark" />
  </div>
);

export const Sizes = () => (
  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
    <Chip icon="calendar" label="3月14日" size="sm" />
    <Chip icon="calendar" label="3月14日" size="md" />
  </div>
);
