import type { ConfigContext, ExpoConfig } from "expo/config";

import pkg from "./package.json";

// アプリのバージョン(ストアに出る user-facing version)の正は package.json の
// version 1か所だけ。app.json は version を持たず、ここで注入する。
// 上げ方・タグの付け方は docs/adr/0025 を参照。
//
// config は app.json を読んだ結果。name・slug は app.json が必ず持つが
// ConfigContext 上は optional なため、ExpoConfig として扱う。
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  version: pkg.version,
});
