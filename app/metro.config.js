const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// inlineRem: rem 由来のユーティリティ（text-sm・px-6 等）の実寸。既定の 14 だと
// Claude Design の px 指定より 12.5% 縮んで描画されるため、Web と同じ 16 に固定する。
module.exports = withNativeWind(config, {
  input: "./src/global.css",
  inlineRem: 16,
});
