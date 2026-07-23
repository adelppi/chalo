import { useBottomSheetInternal } from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useRef } from "react";
import {
  findNodeHandle,
  TextInput,
  type BlurEvent,
  type FocusEvent,
  type HostInstance,
  type TextInputProps,
} from "react-native";

import { shouldClearKeyboardTarget } from "@global/utils/sheetKeyboardTarget";

// findNodeHandle は Fabric のホストインスタンスも実際には受け取れるが、型宣言が旧アーキ時代の
// まま（React.Component 系のみ）のため、この境界だけ型を合わせる。
function nodeHandleOf(instance: HostInstance | null): number | null {
  return findNodeHandle(instance as Parameters<typeof findNodeHandle>[0]);
}

// Sheet（adr/0020）の中で使う入力欄。react-native の TextInput をそのまま描き、
// シートがキーボードを避けるために要る登録（フォーカス中の入力欄のノード）だけを自前で行う。
//
// @gorhom/bottom-sheet の BottomSheetTextInput は使わない。あちらは中身が
// react-native-gesture-handler の TextInput（ネイティブのテキストビューを
// NativeViewGestureHandler で包んだもの）で、iOS の未確定文字列（marked text）が
// 1打鍵ごとに壊れ、日本語のトグル入力・漢字変換ができなくなる（Issue #74）。
export function SheetTextInput({ onFocus, onBlur, ...rest }: TextInputProps) {
  const inputRef = useRef<TextInput>(null);
  const { animatedKeyboardState, textInputNodesRef } = useBottomSheetInternal();

  // シートはフォーカス中の入力欄のノードが判るまで、キーボード表示への追従を保留する。
  const handleFocus = useCallback(
    (event: FocusEvent) => {
      const node = event.nativeEvent.target;
      animatedKeyboardState.set((state) => ({ ...state, target: node }));
      onFocus?.(event);
    },
    [animatedKeyboardState, onFocus],
  );

  const handleBlur = useCallback(
    (event: BlurEvent) => {
      const shouldClear = shouldClearKeyboardTarget({
        keyboardTarget: animatedKeyboardState.get().target,
        blurredNode: event.nativeEvent.target,
        focusedNode: nodeHandleOf(TextInput.State.currentlyFocusedInput()),
        sheetNodes: textInputNodesRef.current,
      });
      if (shouldClear) {
        animatedKeyboardState.set((state) => ({ ...state, target: undefined }));
      }
      onBlur?.(event);
    },
    [animatedKeyboardState, textInputNodesRef, onBlur],
  );

  // 同じシートに属する入力欄として登録する（blur 時に「シート内での移動か」を見分けるため）。
  useEffect(() => {
    const node = findNodeHandle(inputRef.current);
    if (node === null) {
      return;
    }
    const sheetNodes = textInputNodesRef.current;
    sheetNodes.add(node);

    return () => {
      sheetNodes.delete(node);
      if (animatedKeyboardState.get().target === node) {
        animatedKeyboardState.set((state) => ({ ...state, target: undefined }));
      }
    };
  }, [animatedKeyboardState, textInputNodesRef]);

  return (
    <TextInput
      ref={inputRef}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...rest}
    />
  );
}
