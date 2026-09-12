// Tailwind は JIT なので、app/src に出現しないクラスは CSS に含まれない。
// デザインエージェントが自分のレイアウトを書くために必要な語彙を列挙して
// content に食わせる。値の一次情報は app/tailwind.config.js と palette.js。
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { palette } = require("../../app/src/global/constants/palette.js");
const tw = require("../../app/tailwind.config.js");

const colorNames = [];
for (const [k, v] of Object.entries(palette)) {
  if (typeof v === "string") colorNames.push(k);
  else for (const sub of Object.keys(v)) colorNames.push(sub === "DEFAULT" ? k : `${k}-${sub}`);
}

const ALPHA = ["5", "10", "15", "20", "25", "30", "35", "40", "50", "60", "70", "80", "90"];
const SPACE = ["0", "0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "5", "6", "7", "8", "10", "12", "14", "16", "20", "24"];
const out = [];
const add = (...c) => out.push(...c);

for (const c of colorNames) {
  add(`bg-${c}`, `text-${c}`, `border-${c}`);
  for (const a of ALPHA) add(`bg-${c}/${a}`, `text-${c}/${a}`, `border-${c}/${a}`);
}
for (const r of [...Object.keys(tw.theme.extend.borderRadius), "none", "sm", "md", "lg", "xl", "2xl", "3xl", "full"])
  add(`rounded-${r}`, `rounded-t-${r}`, `rounded-b-${r}`);
for (const s of [...Object.keys(tw.theme.extend.boxShadow), "none"]) add(`shadow-${s}`);
for (const w of Object.keys(tw.theme.fontWeight)) add(`font-${w}`);
for (const s of ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"]) add(`text-${s}`);
for (const s of SPACE)
  add(`p-${s}`, `px-${s}`, `py-${s}`, `pt-${s}`, `pb-${s}`, `pl-${s}`, `pr-${s}`,
      `m-${s}`, `mx-${s}`, `my-${s}`, `mt-${s}`, `mb-${s}`, `gap-${s}`, `gap-x-${s}`, `gap-y-${s}`,
      `w-${s}`, `h-${s}`, `top-${s}`, `bottom-${s}`, `left-${s}`, `right-${s}`);
add("flex", "flex-1", "flex-row", "flex-col", "flex-wrap", "flex-shrink-0", "flex-grow",
    "items-start", "items-center", "items-end", "items-stretch", "items-baseline",
    "justify-start", "justify-center", "justify-end", "justify-between", "justify-around",
    "self-start", "self-center", "self-end", "self-stretch",
    "absolute", "relative", "overflow-hidden", "overflow-visible",
    "w-full", "h-full", "w-auto", "h-auto", "w-px", "h-px", "min-h-0", "max-w-full",
    "text-left", "text-center", "text-right", "uppercase", "leading-none", "leading-tight",
    "leading-snug", "leading-normal", "leading-relaxed", "leading-5", "leading-6", "leading-7",
    "tracking-tight", "tracking-normal", "tracking-wide", "opacity-0", "opacity-50", "opacity-70", "opacity-100",
    "border", "border-0", "border-2", "border-t", "border-b", "border-l", "border-r",
    "z-10", "z-20", "z-50", "aspect-square");

const uniq = [...new Set(out)].sort();
fs.writeFileSync("src/_vocabulary.txt", uniq.join("\n") + "\n");
console.log(`vocabulary: ${uniq.length} classes`);

// トークンの CSS カスタムプロパティ。className が使えない箇所（SVG 等）向け。
// 一次情報は palette.js。
const lines = [
  "/* 自動生成（gen-vocabulary.mjs）。一次情報は app/src/global/constants/palette.js。 */",
  ":root {",
];
for (const [k, v] of Object.entries(palette)) {
  if (typeof v === "string") lines.push(`  --chalo-${k}: ${v};`);
  else for (const [sub, val] of Object.entries(v))
    lines.push(`  --chalo-${k}${sub === "DEFAULT" ? "" : "-" + sub}: ${val};`);
}
for (const [k, v] of Object.entries(tw.theme.extend.borderRadius)) lines.push(`  --chalo-radius-${k}: ${v};`);
for (const [k, v] of Object.entries(tw.theme.extend.boxShadow)) lines.push(`  --chalo-shadow-${k}: ${v};`);
for (const [k, v] of Object.entries(tw.theme.fontWeight)) lines.push(`  --chalo-weight-${k}: ${v};`);
// chalo は OS 標準フォント（iOS: 和文ヒラギノ角ゴ / 英数字 SF Pro）。
// フォントファイルは同梱せず、同等のスタックを宣言する（tailwind.config.js の方針）。
lines.push(
  '  --chalo-font-sans: -apple-system, BlinkMacSystemFont, "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Noto Sans JP", system-ui, sans-serif;',
);
lines.push("}", "");
// デザインエージェントが自分で書くマークアップにも同じ書体を効かせる。
// これが無いとブラウザ既定（和文は明朝になりがち）で chalo と違う見た目になる。
lines.push("html, body { font-family: var(--chalo-font-sans); }", "");
fs.mkdirSync("dist", { recursive: true });
fs.writeFileSync("dist/tokens.css", lines.join("\n"));
console.log("wrote dist/tokens.css");
