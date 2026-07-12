const { palette } = require("./src/global/constants/palette");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      // chalo のデザイントークン（Claude Design 由来）。値の直書きをせず必ずここを参照する（adr/0016）。
      // 色の一次情報は src/global/constants/palette.js（SVG 等 className 不可の箇所と共有）。
      colors: palette,
      // フォントは OS 標準（iOS システムフォント。和文はヒラギノ角ゴ／英数字は SF Pro へ
      // 自動フォールバック）。fontFamily は指定せず、ウェイトのユーティリティ
      // （font-normal / font-medium / font-bold / font-black）で階層を表す（Issue #16）。
      borderRadius: {
        // 面（カード・ボタン・シート・ダイアログ・入力欄）の角丸を 8px に統一（Issue #16）。
        // アバター・アイコンボタン・チップ等の円形／ピルは rounded-full を使い対象外。
        card: "8px",
      },
      boxShadow: {
        card: "0 2px 10px rgba(88, 71, 56, 0.07)",
        header: "0 2px 8px rgba(88, 71, 56, 0.08)",
        hero: "0 4px 14px rgba(88, 71, 56, 0.18)",
        fab: "0 6px 18px rgba(88, 71, 56, 0.35)",
        toast: "0 8px 24px rgba(88, 71, 56, 0.3)",
        dialog: "0 12px 40px rgba(88, 71, 56, 0.22)",
        accent: "0 6px 18px rgba(89, 63, 85, 0.3)",
      },
    },
  },
  plugins: [],
};
