import fs from "node:fs";

// SF Symbol 名 -> lucide アイコン名。Icon.tsx の SYMBOL_BY_NAME / FILLED_SYMBOL_BY_NAME が正。
const MAP = {
  "calendar": "calendar",
  "calendar.badge.plus": "calendar-plus",
  "clock": "clock",
  "link": "link",
  "note.text": "notebook-text",
  "mappin": "map-pin",
  "camera": "camera",
  "arrow.up.right.square": "square-arrow-out-up-right",
  "chevron.down": "chevron-down",
  "chevron.left": "chevron-left",
  "chevron.right": "chevron-right",
  "plus": "plus",
  "pawprint": "paw-print",
  "pawprint.fill": "paw-print",
  "checkmark.circle": "circle-check",
  "checkmark.circle.fill": "circle-check",
  "gearshape": "settings",
  "gearshape.fill": "settings",
  "pencil": "pencil",
  "trash": "trash-2",
  "doc.on.doc": "copy",
  "tray.and.arrow.up": "upload",
  "circle.grid.3x3.fill": "grid-3x3",
  "bell": "bell",
  "paperplane": "send",
  "square.and.arrow.up": "share",
  "exclamationmark.circle.fill": "circle-alert",
  "lock": "lock",
};

const inner = {};
for (const [sf, lucide] of Object.entries(MAP)) {
  const svg = fs.readFileSync(`node_modules/lucide-static/icons/${lucide}.svg`, "utf8");
  const m = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  if (!m) throw new Error(`inner svg not found: ${lucide}`);
  inner[sf] = m[1].replace(/\s+/g, " ").trim();
}

const out = `// 自動生成（gen-symbols.mjs）。手で編集しない。
// expo-symbols(SF Symbols) の Web 代替。SF Symbols は Apple のシステムリソースで
// ブラウザに存在しないため、lucide(MIT) の線画で近似する。design-sync 専用の
// プラットフォーム差し替えであり、chalo のコンポーネント実装には手を入れていない。
export const SF_INNER: Record<string, string> = ${JSON.stringify(inner, null, 2)};
`;
fs.writeFileSync("stubs/sf-symbols.generated.ts", out);
console.log(`wrote ${Object.keys(inner).length} symbols`);
