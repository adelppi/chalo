import { Button } from "chalo-ds";

// 文言は実際のアプリ（app/src/features）で使われているものを使う。

export const Variants = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 260 }}>
    <Button label="つづける" variant="primary" />
    <Button label="おしまいにする" variant="accent" icon="check-circle" />
    <Button label="カレンダーに追加" variant="outline" icon="calendar-plus" />
    <Button label="削除する" variant="destructive" icon="trash" />
    <Button label="あとで" variant="ghost" />
  </div>
);

export const OnDark = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 10,
      width: 260,
      background: "#261f19",
      padding: 20,
      borderRadius: 20,
    }}
  >
    <Button label="コードをコピーする" variant="cream" icon="copy" />
    <Button label="とじる" variant="ghost" />
  </div>
);

export const Sizes = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 260 }}>
    <Button label="決定" size="sm" />
    <Button label="はじめよう！" size="md" />
    <Button label="おしまいにする" size="lg" variant="accent" />
  </div>
);

export const Disabled = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 260 }}>
    <Button label="つながる" disabled />
    <Button label="追加する" disabled icon="plus" />
  </div>
);
