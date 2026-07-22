const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    // supabase/functions は Deno ランタイム（別 lint 対象。jsr:/npm: 解決や Deno
    // グローバルを ESLint は理解できない）。
    ignores: ["dist/*", "supabase/functions/**"],
  },
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@features/*/*"],
              message:
                "feature 内部フォルダへは直接 import できません。対象 feature の index.ts(バレル)経由で import してください。",
            },
          ],
        },
      ],
    },
  },
  {
    // 依存の方向は app → features → global の一方向（adr/0015）。global から
    // feature への逆流は require cycle を生むため lint で止める（Issue #70）。
    // 例外は global/data（Repository の実装。feature の契約に依存してよい）。
    files: ["src/global/**"],
    ignores: ["src/global/data/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@features/*", "@features/*/*"],
              message:
                "global から feature へは import できません(adr/0015: app → features → global の一方向)。共有したい部品は該当 feature に置き、そのバレルから公開してください。例外は Repository 実装を集約する global/data のみです。",
            },
          ],
        },
      ],
    },
  },
]);
