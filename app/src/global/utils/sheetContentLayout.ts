// シート（adr/0022）の中身の高さの決め方。純粋関数（adr/0014）。
//
// ネイティブのシートは中身の高さに追従する（fitToContents）。中身をそのまま描くと、
// 長い一覧（既定カレンダー選択）のときに画面を埋め尽くしてしまうため、上限を設けて
// 超えた分はシートの中でスクロールさせる。

export type SheetContentLayoutInput = {
  /** 中身の自然な高さ。まだ測れていなければ null */
  measuredHeight: number | null;
  /** シートの中身の高さの上限 */
  maxHeight: number;
};

export type SheetContentLayout = {
  /** 中身に与える高さ。未測定のあいだは undefined（自然な高さに任せる） */
  height: number | undefined;
  /** 上限を超えていてスクロールが要るか */
  scrollable: boolean;
};

/**
 * 測った自然な高さから、シートの中身に与える高さとスクロールの要否を決める。
 *
 * 未測定のあいだは高さを指定しない。上限を超えていたら上限で頭打ちにし、その分だけ
 * スクロールさせる。ちょうど上限のときはスクロール量が 0 になるだけなので超過側に含める。
 */
export function resolveSheetContentLayout({
  measuredHeight,
  maxHeight,
}: SheetContentLayoutInput): SheetContentLayout {
  if (measuredHeight === null) {
    return { height: undefined, scrollable: false };
  }
  const scrollable = measuredHeight >= maxHeight;
  return {
    height: scrollable ? maxHeight : measuredHeight,
    scrollable,
  };
}
