// Web ビルド用。トークン定義は app/tailwind.config.js（正）をそのまま読み込む。
const appConfig = require("../../app/tailwind.config.js");

module.exports = {
  ...appConfig,
  content: [
    "../../app/src/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./stubs/**/*.{ts,tsx}",
    "../previews/**/*.tsx",
    // デザインエージェントが使う語彙（gen-vocabulary.mjs が生成）
    "./src/_vocabulary.txt",
  ],
};
