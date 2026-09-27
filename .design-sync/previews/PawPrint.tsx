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
