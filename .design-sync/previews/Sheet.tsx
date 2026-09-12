import { Button, Chip, Sheet } from "chalo-ds";

// 下から重なるシート（C-3b 日時ピッカー等）。うしろの画面は見えたまま。
const noop = () => {};

export const DatePicker = () => (
  <Sheet visible title="日時をえらぶ" onClose={noop} action={{ label: "クリア", onPress: noop }}>
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "4px 0 8px" }}>
      <div style={{ display: "flex", gap: 8 }}>
        <Chip icon="calendar" label="3月14日（金）" size="md" />
        <Chip icon="clock" label="18:00" size="md" tone="blush" />
      </div>
      <Button label="決定" />
    </div>
  </Sheet>
);

export const Picker = () => (
  <Sheet visible title="既定カレンダーをえらぶ" onClose={noop}>
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "4px 0 8px" }}>
      {["個人", "仕事", "ふたりの予定"].map((name) => (
        <div
          key={name}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#F7F2E6",
            borderRadius: 18,
            padding: "14px 16px",
            fontSize: 15,
            fontWeight: 500,
            color: "#261f19",
          }}
        >
          {name}
        </div>
      ))}
    </div>
  </Sheet>
);
