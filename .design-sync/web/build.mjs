import * as esbuild from "esbuild";
import path from "node:path";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const appSrc = path.resolve(here, "../../app/src");

// react-native -> react-native-web、expo-symbols -> 自前スタブ。
// 差し替えるのはプラットフォーム層だけで、chalo のコンポーネントは実コードを使う。
// tsconfig paths 相当の解決。esbuild の onResolve は結果が最終なので拡張子を自前で探す。
const EXTS = [".web.tsx", ".web.ts", ".tsx", ".ts", ".web.js", ".js", ".json", ".png", ".gif"];
function require_resolve_main(pkgDir) {
  const pj = JSON.parse(fs.readFileSync(path.join(pkgDir, "package.json"), "utf8"));
  const main = pj.main || "index.js";
  return resolveSrc(path.resolve(pkgDir, main));
}

function resolveSrc(base) {
  if (fs.existsSync(base) && fs.statSync(base).isFile()) return base;
  for (const e of EXTS) if (fs.existsSync(base + e)) return base + e;
  // ディレクトリに package.json がある場合はその main を辿る
  // （react-native-css-interop/jsx-runtime など）。
  const pj = path.join(base, "package.json");
  if (fs.existsSync(pj)) {
    const j = JSON.parse(fs.readFileSync(pj, "utf8"));
    const m = j.module || j.main;
    if (m) return resolveSrc(path.resolve(base, m));
  }
  for (const e of EXTS) {
    const idx = path.join(base, "index" + e);
    if (fs.existsSync(idx)) return idx;
  }
  throw new Error(`cannot resolve: ${base}`);
}

// app/node_modules と web ワークスペースの両方から解決されうるパッケージ。
// 二重に入ると React Context の同一性が壊れる（safe-area の insets が null に
// なって ChaloTabBar が落ちた）。web ワークスペース側の 1 コピーに固定する。
const DEDUPE = ["react-native-safe-area-context", "react-native-css-interop", "nativewind"];

const aliasPlugin = {
  name: "chalo-alias",
  setup(b) {
    b.onResolve({ filter: new RegExp(`^(${DEDUPE.join("|")})(/.*)?$`) }, (a) => {
      const base = DEDUPE.find((d) => a.path === d || a.path.startsWith(d + "/"));
      const sub = a.path.slice(base.length);
      const root = path.resolve(here, "node_modules", base);
      return { path: sub ? resolveSrc(path.join(root, sub)) : require_resolve_main(root) };
    });
    b.onResolve({ filter: /^react-native$/ }, () => ({
      path: path.resolve(here, "node_modules/react-native-web/dist/index.js"),
    }));
    b.onResolve({ filter: /^expo-symbols$/ }, () => ({
      path: path.resolve(here, "stubs/expo-symbols.tsx"),
    }));
    b.onResolve({ filter: /^@global\// }, (a) => ({
      path: resolveSrc(path.resolve(appSrc, "global", a.path.slice("@global/".length))),
    }));
    b.onResolve({ filter: /^@\// }, (a) => ({
      path: resolveSrc(path.resolve(appSrc, a.path.slice(2))),
    }));
  },
};

// --- SF Symbol → SVG 対応表（バンドルが import するので先に生成する）-------
execFileSync("node", ["gen-symbols.mjs"], { cwd: here, stdio: "inherit" });

const r = await esbuild.build({
  entryPoints: [path.resolve(here, "src/entry.tsx")],
  outfile: path.resolve(here, "dist/index.cjs"),
  bundle: true,
  // CJS 出力。ESM + external react だと CJS 依存の require("react") が
  // __require のランタイム例外になり、design-sync 側の react shim が拾えない。
  format: "cjs",
  platform: "browser",
  target: "es2020",
  jsx: "automatic",
  jsxImportSource: "nativewind",
  external: ["react", "react-dom", "react-is"],
  nodePaths: [path.resolve(here, "node_modules")],
  metafile: true,
  // .web.* を優先解決（react-native-safe-area-context 等）
  resolveExtensions: [".web.tsx", ".web.ts", ".web.jsx", ".web.js", ".tsx", ".ts", ".jsx", ".js", ".json"],
  mainFields: ["browser", "module", "main"],
  conditions: ["browser", "import", "default"],
  loader: { ".png": "dataurl", ".gif": "dataurl", ".jpg": "dataurl" },
  define: { "process.env.NODE_ENV": '"production"', __DEV__: "false" },
  plugins: [aliasPlugin],
  logLevel: "info",
});

if (r.metafile) fs.writeFileSync(path.resolve(here, "dist/meta.json"), JSON.stringify(r.metafile));

{
  // react-native-web が挿入する <style id="react-native-stylesheet"> は
  // design-sync の validate が使う [id^="r"] セレクタに先に引っかかり、
  // 「root empty」の誤判定になる。id を r 始まり以外へ変える（用途は重複除去のみ）。
  {
    const f = path.resolve(here, "dist/index.cjs");
    const before = fs.readFileSync(f, "utf8");
    const after = before.replace('"react-native-stylesheet"', '"ds-rnw-stylesheet"');
    if (after === before) throw new Error("react-native-stylesheet の id 置換に失敗（rnw の実装変更？）");
    fs.writeFileSync(f, after);
  }

  // --- 型定義 ---------------------------------------------------------
  // app の実ソースから tsc で .d.ts を出す（手書きは props のドリフトを招く）。
  execFileSync("npx", ["tsc", "-p", "tsconfig.build.json"], { cwd: here, stdio: "inherit" });
  // tsc は path alias を .d.ts に残すので相対パスへ書き換える。
  const entryDts = path.resolve(here, "dist/types/.design-sync/web/src/entry.d.ts");
  const entryDir = path.dirname(entryDts);
  const appSrcTypes = path.resolve(here, "dist/types/app/src");
  fs.writeFileSync(
    entryDts,
    fs.readFileSync(entryDts, "utf8").replace(/"@global\/([^"]+)"/g, (_, rest) => {
      const abs = path.join(appSrcTypes, "global", rest);
      let rel = path.relative(entryDir, abs);
      if (!rel.startsWith(".")) rel = "./" + rel;
      return JSON.stringify(rel);
    }),
  );

  // --- 語彙 + トークン CSS ----------------------------------------------
  execFileSync("node", ["gen-vocabulary.mjs"], { cwd: here, stdio: "inherit" });

  // --- CSS ------------------------------------------------------------
  // NATIVEWIND_OS 未設定 = nativewind の web プリセット（標準 Tailwind CSS 出力）。
  execFileSync("npx", ["tailwindcss", "-c", "tailwind.config.js", "-i", "src/global.css", "-o", "dist/ds.css"], {
    cwd: here,
    stdio: "inherit",
    env: { ...process.env, NATIVEWIND_OS: "" },
  });
  // トークンと基本フォントを CSS 本体の先頭に畳み込む。
  // design-sync の tokens/ は cfg.tokensPkg（node_modules のパッケージ）前提で、
  // tokensGlob だけでは効かない。デザインに届くのは styles.css の @import closure
  // なので、cssEntry である ds.css 自体に入れるのが確実。
  {
    const css = path.resolve(here, "dist/ds.css");
    const tokens = fs.readFileSync(path.resolve(here, "dist/tokens.css"), "utf8");
    fs.writeFileSync(css, tokens + "\n" + fs.readFileSync(css, "utf8"));
  }
  console.log("built: dist/index.cjs, dist/types/, dist/ds.css");
}
