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
]);
