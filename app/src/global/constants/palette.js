// chalo のカラーパレット（一次情報）。
// tailwind.config.js（className 用）と、SVG 等 className を使えない箇所の両方がここを参照する。
// CommonJS なのは tailwind.config.js から require するため。
const palette = {
  ink: "#584738", // 基調の焦げ茶。見出し・本文・主ボタン
  linen: "#F1EADA", // 画面背景。暗色上のテキストにも使う
  paper: "#FFFCF5", // カード・タブバーの表面
  sand: "#F0E8D5", // カード内の区切り線
  cream: "#F7F2E6", // 入力フィールドの背景
  wheat: "#E7DCC5", // シートのつまみ・淡い円形背景
  latte: "#CEC1A8", // プレースホルダ・非活性・補足テキスト
  taupe: "#8B7D6A", // セカンダリテキスト
  stone: "#AAA396", // 三次テキスト・非選択タブ
  camel: "#B59E7D", // 日付チップ・アバター背景
  plum: "#8C646E", // アクセント（おしまい・期限・強調）
  blush: "#F2ECEB", // plum の淡背景チップ
  rust: "#A8574F", // 破壊的操作・エラー
  honey: {
    DEFAULT: "#9A7B2E", // 編集ロック注意のアイコン
    surface: "#F6EFDD", // 注意カードの背景
    border: "#E0CF9E", // 注意カードの枠線
    text: "#6E561B", // 注意カードの見出し
    soft: "#9A8342", // 注意カードの本文
    muted: "#E0D6C2", // 非活性ボタンの背景
  },
};

module.exports = { palette };
