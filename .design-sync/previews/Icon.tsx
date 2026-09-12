import { Icon } from "chalo-ds";

const ALL = [
  "calendar", "calendar-plus", "clock", "link", "note", "pin", "camera",
  "external", "chevron-down", "chevron-left", "chevron-right", "plus",
  "paw", "check-circle", "gear", "pencil", "trash", "copy", "tray-up",
  "keypad", "bell", "send", "share", "alert-circle", "lock",
] as const;

const cell = {
  display: "flex" as const,
  flexDirection: "column" as const,
  alignItems: "center" as const,
  gap: 6,
  width: 68,
};
const caption = { fontSize: 9, color: "#8B7D6A", fontFamily: "ui-monospace, monospace" };

export const AllIcons = () => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, width: 420 }}>
    {ALL.map((name) => (
      <div key={name} style={cell}>
        <Icon name={name} size={20} color="#261f19" />
        <span style={caption}>{name}</span>
      </div>
    ))}
  </div>
);

export const Sizes = () => (
  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
    <Icon name="paw" size={14} color="#261f19" />
    <Icon name="paw" size={18} color="#261f19" />
    <Icon name="paw" size={24} color="#261f19" />
    <Icon name="paw" size={32} color="#261f19" />
  </div>
);

// 選択中は .fill バリアントへ切り替わる（タブバー）。
export const Filled = () => (
  <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
    <Icon name="paw" size={24} color="#AAA396" />
    <Icon name="paw" size={24} color="#261f19" filled />
    <Icon name="check-circle" size={24} color="#AAA396" />
    <Icon name="check-circle" size={24} color="#261f19" filled />
    <Icon name="gear" size={24} color="#AAA396" />
    <Icon name="gear" size={24} color="#261f19" filled />
  </div>
);

// alert-circle だけは 2 色（円の塗り + 抜き文字）。
export const Palette = () => (
  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
    <Icon name="alert-circle" size={28} color="#A8574F" />
    <Icon name="alert-circle" size={28} color="#9A7B2E" accentColor="#F6EFDD" />
  </div>
);
