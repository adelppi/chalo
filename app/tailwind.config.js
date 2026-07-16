const { palette } = require("./src/global/constants/palette");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    // font-black（900）は廃止し、書けない状態にする（Issue #45）。
    // それ以外は Tailwind 既定のウェイト一覧をそのまま踏襲する。
    fontWeight: {
      thin: "100",
      extralight: "200",
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },
    extend: {
      // chalo のデザイントークン（Claude Design 由来）。値の直書きをせず必ずここを参照する（adr/0016）。
      // 色の一次情報は src/global/constants/palette.js（SVG 等 className 不可の箇所と共有）。
      colors: palette,
      // フォントは OS 標準（iOS システムフォント。和文はヒラギノ角ゴ／英数字は SF Pro へ
      // 自動フォールバック）。fontFamily は指定せず、ウェイトのユーティリティ
      // （font-normal / font-medium / font-bold）で階層を表す（Issue #16→Issue #45）。
      // 角丸は Claude Design の使い分けに忠実に合わせる（Issue #16）。
      // 円形／ピル（アバター・アイコンボタン・チップ等）は rounded-full を使う。
      borderRadius: {
        chip: "10px", // 小さなアイコンボックス・時刻の値ボックス（D-1・C-3b）
        control: "14px", // ダイアログ内のボタン・入力ボックス（F-1 系）
        button: "16px", // 画面のボタン・時刻行・サインインボタン（C-3・D-1 ほか）
        field: "18px", // タイトル/コード入力欄・フォーム項目カード・設定カード（C-3・B-3・E-1）
        card: "20px", // 一覧・内容カード（C-1a・D-1・D-4・B-1）
        hero: "22px", // つぎの予定・招待コード表示カード（C-1a・B-2）
        dialog: "24px", // ダイアログ（F-1 系）
        sheet: "28px", // ボトムシートの上辺（C-3b）
      },
      boxShadow: {
        card: "0 2px 10px rgba(88, 71, 56, 0.07)",
        header: "0 2px 8px rgba(88, 71, 56, 0.08)",
        hero: "0 4px 14px rgba(88, 71, 56, 0.25)",
        fab: "0 6px 18px rgba(88, 71, 56, 0.35)",
        toast: "0 8px 24px rgba(88, 71, 56, 0.3)",
        dialog: "0 12px 40px rgba(88, 71, 56, 0.22)",
        accent: "0 6px 18px rgba(89, 63, 85, 0.3)",
      },
    },
  },
  plugins: [],
};
