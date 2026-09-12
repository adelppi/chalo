import { Avatar } from "chalo-ds";

export const Tones = () => (
  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
    <Avatar initial="ゆ" tone="camel" size={26} />
    <Avatar initial="か" tone="plum" size={26} />
  </div>
);

export const Sizes = () => (
  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
    <Avatar initial="ゆ" size={22} />
    <Avatar initial="ゆ" size={26} />
    <Avatar initial="ゆ" size={34} />
    <Avatar initial="ゆ" size={48} />
  </div>
);

// ペア成立画面（B-5）での並び。
export const PairRow = () => (
  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FFFCF5", borderRadius: 999, padding: "8px 16px" }}>
      <Avatar initial="ゆ" size={26} />
      <span style={{ fontSize: 14, fontWeight: 500, color: "#261f19" }}>ゆうこ</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FFFCF5", borderRadius: 999, padding: "8px 16px" }}>
      <Avatar initial="か" tone="plum" size={26} />
      <span style={{ fontSize: 14, fontWeight: 500, color: "#261f19" }}>かずき</span>
    </div>
  </div>
);
