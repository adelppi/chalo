import { SymbolView } from "expo-symbols";
import type { SFSymbol } from "sf-symbols-typescript";

// SF Symbol（expo-symbols）に統一したアイコンセット。iOS のみが対象なので
// Android/Web 向けのフォールバック名は持たない（CLAUDE.md：iOS のみ）。
export type IconName =
  | "calendar"
  | "calendar-plus"
  | "clock"
  | "link"
  | "note"
  | "pin"
  | "camera"
  | "external"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "plus"
  | "paw"
  | "check-circle"
  | "gear"
  | "pencil"
  | "trash"
  | "copy"
  | "tray-up"
  | "keypad"
  | "bell"
  | "send"
  | "share"
  | "alert-circle"
  | "lock";

const SYMBOL_BY_NAME: Record<IconName, SFSymbol> = {
  calendar: "calendar",
  "calendar-plus": "calendar.badge.plus",
  clock: "clock",
  link: "link",
  note: "note.text",
  pin: "mappin",
  camera: "camera",
  external: "arrow.up.right.square",
  "chevron-down": "chevron.down",
  "chevron-left": "chevron.left",
  "chevron-right": "chevron.right",
  plus: "plus",
  paw: "pawprint",
  "check-circle": "checkmark.circle",
  gear: "gearshape",
  pencil: "pencil",
  trash: "trash",
  copy: "doc.on.doc",
  "tray-up": "tray.and.arrow.up",
  keypad: "circle.grid.3x3.fill",
  bell: "bell",
  send: "paperplane",
  share: "square.and.arrow.up",
  "alert-circle": "exclamationmark.circle.fill",
  lock: "lock",
};

// .fill バリアントが存在し、かつ選択状態の塗り分けが必要なもの（タブバー等）のみ
const FILLED_SYMBOL_BY_NAME: Partial<Record<IconName, SFSymbol>> = {
  paw: "pawprint.fill",
  "check-circle": "checkmark.circle.fill",
  gear: "gearshape.fill",
};

type IconProps = {
  name: IconName;
  size?: number;
  color: string;
  /** タブバー等、選択中に .fill バリアントへ切り替える */
  filled?: boolean;
  /** 2トーン系アイコン（alert-circle の「!」）の前景色 */
  accentColor?: string;
};

export function Icon({
  name,
  size = 16,
  color,
  filled,
  accentColor,
}: IconProps) {
  const symbolName =
    (filled && FILLED_SYMBOL_BY_NAME[name]) || SYMBOL_BY_NAME[name];

  if (name === "alert-circle") {
    return (
      <SymbolView
        name={symbolName}
        type="palette"
        colors={[accentColor ?? "#FFFCF5", color]}
        size={size}
      />
    );
  }

  return (
    <SymbolView
      name={symbolName}
      type="monochrome"
      tintColor={color}
      size={size}
    />
  );
}
