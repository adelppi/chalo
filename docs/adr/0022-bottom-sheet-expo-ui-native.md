# ADR-0022: ボトムシート基盤を @expo/ui のネイティブシートにする

- ステータス: 採用 [提案→要承認]
- 関連: adr/0006, adr/0014, adr/0015, adr/0016, adr/0020（本 ADR で廃止）, Issue #74, Issue #76

## コンテキスト

`global/components/ui/Sheet.tsx` は `@gorhom/bottom-sheet` の `BottomSheetModal` で
実装していた（`adr/0020`）。下から重なる3つのシート（日時・期限ピッカー C-3b／参考URL・メモ入力／
既定カレンダー選択）が対象。

このシートの中の入力欄で、**iOS の日本語 IME の未確定文字列（marked text）が1打鍵ごとに壊れる**
（`Issue #74`）。「あ」を3回連打しても `う` にならず、ひらがなの確定・漢字変換ができない。

当初はライブラリ提供の `BottomSheetTextInput` が原因と考えた。あれは中身が
react-native-gesture-handler の `TextInput`（ネイティブのテキストビューを `NativeViewGestureHandler`
で包んだもの）で、marked text を壊すのは既知の挙動だったためである。そこで素の
react-native `TextInput` を使い、シートがキーボードを避けるのに要る登録
（`useBottomSheetInternal` の `animatedKeyboardState.target` の出し入れ）だけを自前で行う
`SheetTextInput` を作った（`Issue #75`）。**しかし実機で症状が残った**。原因は入力欄ではなく
シートのコンテナ側にある。

`@gorhom/bottom-sheet` はシート全体を reanimated のアニメーションビューとして描き、
キーボード表示に合わせて毎フレーム変形させる。この上に載ったネイティブのテキストビューは
未確定文字列を保てない。入力欄を差し替えても、コンテナが JS 側で描かれている限りは直らない。

## 決定

**`@expo/ui/community/bottom-sheet`（Expo SDK 57 同梱・`@expo/ui@~57.0.7`）** に置き換え、
iOS のネイティブなシート（SwiftUI の `.sheet` プレゼンテーション）の上に中身を載せる。
`@gorhom/bottom-sheet` は依存から外す。

- **`Sheet` の外部インターフェースは変えない**：`visible` / `title` / `onClose` / `action` /
  `children` / `testID` をそのまま保つ。`visible` は `BottomSheet` の `index`（`0` / `-1`）へ
  橋渡しする（`present()`/`dismiss()` の ref 経由の橋渡しは不要になった）。
- **入力欄は素の `TextInput`**：キーボード回避はネイティブのシートが持つため、シート専用の
  入力欄ラッパー（`SheetTextInput`）と登録判定（`sheetKeyboardTarget`）は要らない。両方とも作らない。
- **開閉手段**：`enablePanDownToClose` を付ける。iOS ではこの1つのフラグでスワイプダウンと
  背景タップの両方が有効になる（SwiftUI は片方だけにできない）。
- **見た目**：背景色は `presentationBackground` で `paper` を再現する。角丸・ドラッグ
  インジケータ・背景の暗さ・アニメーションは **iOS 標準に従う**（`backgroundStyle` の角丸、
  `handleIndicatorStyle` の `wheat` 色のハンドルは再現しない）。ネイティブの部品を優先する
  方針（`adr/0016`）に沿う。
- **高さ**：`enableDynamicSizing`（中身の高さに追従）を使う。ライブラリに
  `maxDynamicContentSize` 相当がないため、中身の自然な高さを測って画面高の70%で頭打ちにし、
  超えた分だけシートの中でスクロールさせる。この判定は
  `global/utils/sheetContentLayout.ts` の純粋関数に切り出して Jest でテストする（`adr/0014`）。
- **中身のタップは `keyboardShouldPersistTaps="handled"`** [確定]：既定（`never`）だと、
  キーボード表示中の最初のタップがキーボードを閉じるだけで消費され、「決定」が押せない。
- **シートを開いている間は、うしろの画面のキーボード回避を止める** [確定]：シートの中の
  入力欄で出たキーボードに `KeyboardAvoidingView` が反応すると、どうせシートに隠れる位置なのに
  開いた瞬間だけ画面下部の CTA（「保存する」）がせり上がって見える。シートを開いたら
  `enabled={false}` にし、**キーボードが消えきってから**（`keyboardDidHide`）戻す。出ている
  うちに戻すと、抑えていた余白が一気に入って跳ねる（`KeyboardAvoidingView` は無効中も
  キーボード高を内部に溜め、有効化した瞬間に反映する）。
- **表示中にアンマウントしない** [確定]：ネイティブのシートは、表示中に React 側で
  アンマウントすると画面に残り続け、以後の操作を受け付けなくなる。呼び出し元は
  「開いている間だけマウントする」のをやめ、**マウントしたまま `visible` で開閉する**。
  「開くたびに初期値をリセットする」は `key`（開くたびに増やす session 番号）で担う。
  `PlanFormScreen` は直近に開いたシートだけをマウントしたままにする。

## 結果

- 良い点：シートが OS のシートそのものになり、日本語 IME の未確定入力・変換候補バーからの
  漢字変換が壊れなくなる。キーボード回避・内部スクロールとの協調・開閉ジェスチャーはすべて
  OS 側が持つため、自前コード（`SheetTextInput`・`sheetKeyboardTarget`・`BottomSheetBackdrop`
  の設定）が消える。`GestureHandlerRootView` / `BottomSheetModalProvider` の設置が
  シートの前提ではなくなる（`BottomSheetModalProvider` は撤去。`GestureHandlerRootView` は
  expo-router 側が要求するため残す）。
- 留意点：
  - **見た目が iOS 標準になる**。角丸とハンドルの色はデザイン（Issue #58）と一致しない。
  - **表示中のアンマウントが禁じ手になる**（上記）。新しくシートを足すときも同じ作法にする。
  - `BottomSheetBackdrop` / `BottomSheetHandle` / `BottomSheetFooter` に相当する差し込みはできない。
  - シートを開閉したあと、画面内の一部の要素が **アクセシビリティツリーから欠ける**ことがある
    （表示・タップは正常）。Maestro から `id` で参照できなくなる箇所が出うる。
  - ネイティブ依存としての `@expo/ui` は expo-router 経由で既にリンク済みのため、この置き換え
    自体で新しいネイティブモジュールは増えない。ただし `@gorhom/bottom-sheet` の削除と
    `@expo/ui` の明示追加で依存グラフは変わるため、リリースはストアビルドに乗せる（`adr/0006`）。
  - IME は E2E で再現できない（未確定状態を自動化できない）ため、検証は実機・シミュレータでの
    手動確認に委ねる（`adr/0014`）。

## 検討した代替案

- **`@swmansion/react-native-bottom-sheet`**：ネイティブの UIKit ビューを自前で持つため
  サーフェスの見た目を保てるが、0.16.2（pre-1.0）で API も別物。今回は不採用。IME が
  ネイティブシートでも直らなかった場合の次の候補として残す。
- **React Native Elements の `BottomSheet`**：中身が RN の `Modal` ラッパーで、スワイプ閉じ・
  動的サイジングを持たない。`adr/0020` が自前 `Modal` 実装をやめた理由にそのまま戻るため不採用。
- **expo-router のネイティブ formSheet（`presentation: 'formSheet'`）**：シートを画面として
  持つ構造変更になり、3箇所の呼び出し元をすべて書き換えることになる。今回の範囲に対して大きい。
- **`@gorhom/bottom-sheet` のまま入力欄だけ直す**（`Issue #75`）：実機で症状が残ったため棄却。
