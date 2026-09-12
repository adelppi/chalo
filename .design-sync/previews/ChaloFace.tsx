import { ChaloFace } from "chalo-ds";

// チャロくんの顔（空状態・お祝い画面・ペア成立）。手描きインクの GIF。

export const Default = () => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 20 }}>
    <ChaloFace width={128} />
  </div>
);

export const OnDark = () => (
  <div style={{ background: "#261f19", padding: 28, borderRadius: 22 }}>
    <ChaloFace width={128} light />
  </div>
);

// ペア成立（B-5）の見せ方。
export const Celebration = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: 300,
      padding: 28,
      background: "#F1EADA",
      borderRadius: 22,
    }}
  >
    <ChaloFace width={128} />
    <span style={{ marginTop: 22, fontSize: 28, fontWeight: 700, color: "#261f19" }}>
      つながりました！
    </span>
    <span style={{ marginTop: 8, fontSize: 13, fontWeight: 500, color: "#8B7D6A" }}>
      ふたりでプランを貯めていきましょう
    </span>
  </div>
);
