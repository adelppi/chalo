import { IconButton } from "chalo-ds";

// 画面ヘッダーの丸ボタン（D-1 等）。
export const HeaderActions = () => (
  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
    <IconButton icon="chevron-left" />
    <IconButton icon="pencil" />
    <IconButton icon="share" />
    <IconButton icon="trash" color="#A8574F" />
  </div>
);

export const OnHeader = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: 340,
      background: "#F1EADA",
      padding: "12px 16px",
      borderRadius: 20,
    }}
  >
    <IconButton icon="chevron-left" />
    <span style={{ fontSize: 17, fontWeight: 700, color: "#261f19" }}>箱根の温泉</span>
    <div style={{ display: "flex", gap: 8 }}>
      <IconButton icon="pencil" />
      <IconButton icon="trash" color="#A8574F" />
    </div>
  </div>
);
