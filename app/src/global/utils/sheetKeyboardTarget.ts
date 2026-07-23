// シート（adr/0020）が「いまキーボードを出している入力欄」として覚えるノードの判定。純粋関数（adr/0014）。
//
// @gorhom/bottom-sheet はキーボード表示イベントを受け取っても、フォーカス中の入力欄のノード
// （keyboard target）が未設定のあいだは位置合わせを保留する。そのため入力欄側が focus / blur で
// target を出し入れする必要がある。ここはその blur 側の判定だけを切り出したもの。

export type ClearKeyboardTargetInput = {
  /** シートがいま覚えている入力欄のノード（未設定なら undefined） */
  keyboardTarget: number | undefined;
  /** blur した入力欄のノード */
  blurredNode: number;
  /** blur の直後にフォーカスを持っている入力欄のノード（無ければ null） */
  focusedNode: number | null;
  /** 同じシートに属する入力欄のノード */
  sheetNodes: ReadonlySet<number>;
};

/**
 * blur を受けて keyboard target を消すべきかを判定する。
 *
 * 消すのは「いま覚えている入力欄自身が blur した」ときだけ。ただし同じシート内の別の入力欄へ
 * フォーカスが移っただけなら、キーボードは出たままなので消さない（消すとシートが一度沈む）。
 */
export function shouldClearKeyboardTarget({
  keyboardTarget,
  blurredNode,
  focusedNode,
  sheetNodes,
}: ClearKeyboardTargetInput): boolean {
  if (keyboardTarget !== blurredNode) {
    return false;
  }
  const movedToSheetInput = focusedNode !== null && sheetNodes.has(focusedNode);
  return !movedToSheetInput;
}
