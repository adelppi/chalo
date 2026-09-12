import { PawPrint } from "chalo-ds";

// チャロくんの足あと（空状態・カード装飾・おわったプランの行頭）。

export const Sizes = () => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
    <PawPrint size={24} />
    <PawPrint size={36} />
    <PawPrint size={56} />
    <PawPrint size={80} />
  </div>
);

export const Opacity = () => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
    <PawPrint size={56} opacity={1} />
    <PawPrint size={56} opacity={0.5} />
    <PawPrint size={56} opacity={0.14} />
    <PawPrint size={56} opacity={0.07} />
  </div>
);

export const OnDark = () => (
  <div style={{ background: "#261f19", padding: 24, borderRadius: 20, display: "flex", gap: 16 }}>
    <PawPrint size={56} light />
    <PawPrint size={56} light opacity={0.4} />
  </div>
);

// カード背景の装飾（薄く・傾けて置く）。
export const AsDecoration = () => (
  <div
    style={{
      position: "relative",
      width: 300,
      height: 140,
      background: "#FFFCF5",
      borderRadius: 20,
      overflow: "hidden",
      boxShadow: "0 2px 10px rgba(88, 71, 56, 0.07)",
    }}
  >
    <div style={{ position: "absolute", right: -10, bottom: -16 }}>
      <PawPrint size={130} opacity={0.07} rotate="-16deg" />
    </div>
    <div style={{ padding: 20 }}>
      <span style={{ fontSize: 17, fontWeight: 700, color: "#261f19" }}>まだプランがありません</span>
      <div style={{ marginTop: 6, fontSize: 13, fontWeight: 500, color: "#8B7D6A" }}>
        行きたい所を書きとめてみましょう
      </div>
    </div>
  </div>
);
