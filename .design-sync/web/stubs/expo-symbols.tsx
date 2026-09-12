// expo-symbols の Web 代替（design-sync 専用）。
// SF Symbols は iOS のシステムリソースのためブラウザに存在しない。lucide(MIT) の
// 線画 SVG で近似する。差し替えているのはプラットフォームのプリミティブだけで、
// chalo の Icon.tsx 本体はそのままビルドしている。
import * as React from "react";

import { SF_INNER } from "./sf-symbols.generated";

// .fill バリアントは SF では塗り。線画で塗りは再現できないため線を太くして
// 「選択中」の重さを表す（タブバー等の用途）。
const FILL_VARIANTS = new Set([
  "pawprint.fill",
  "checkmark.circle.fill",
  "gearshape.fill",
]);

type SymbolViewProps = {
  name: string;
  size?: number;
  type?: "monochrome" | "palette" | "hierarchical" | "multicolor";
  tintColor?: string | null;
  colors?: string[];
  style?: any;
};

export function SymbolView({
  name,
  size = 16,
  type = "monochrome",
  tintColor,
  colors,
  style,
}: SymbolViewProps) {
  const inner = SF_INNER[name];

  // palette は 2 色指定（chalo では alert-circle のみ）。SF は「塗り円 + 抜き文字」
  // なので、そこだけは近似ではなく同じ構造で描く。
  if (type === "palette" && colors && colors.length >= 2) {
    const [glyph, base] = colors;
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={{ display: "block", flexShrink: 0, ...(style || {}) }}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="11" fill={base} />
        <path
          d="M12 6.2a1.35 1.35 0 0 1 1.35 1.44l-.4 5.6a.96.96 0 0 1-1.9 0l-.4-5.6A1.35 1.35 0 0 1 12 6.2Z"
          fill={glyph}
        />
        <circle cx="12" cy="16.6" r="1.4" fill={glyph} />
      </svg>
    );
  }

  if (!inner) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={tintColor || "currentColor"}
      strokeWidth={FILL_VARIANTS.has(name) ? 2.6 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", flexShrink: 0, ...(style || {}) }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}

export default { SymbolView };
