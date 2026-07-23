# ADR-0020: ボトムシート基盤に @gorhom/bottom-sheet を採用する

- ステータス: 採用 [提案→要承認]
- 関連: adr/0014, adr/0015, adr/0016, docs/domain/plan-lifecycle.md, Issue #58

## コンテキスト

`global/components/ui/Sheet.tsx` は `Modal`（`transparent` + `animationType="slide"`）と
`KeyboardAvoidingView` の自前実装で、下から重なるシート（日時・期限ピッカー C-3b、参考URL・メモ入力、
既定カレンダー選択）に使っている。この自前実装には次の課題がある。

- **スワイプダウンで閉じられない**：`Modal` は指の動きに追従するジェスチャーを持たず、閉じる手段が
  背景タップのみ。iOS のネイティブなシートの挙動と乖離する。
- **キーボード回避が `behavior="padding"` 頼み**：入力シート（参考URL・メモ）でキーボード表示時の
  余白調整が機種・状況依存で崩れやすい。
- **中身が長いと画面内スクロールと外側の閉じるジェスチャーが両立しない**：既定カレンダー選択シート
  （`CalendarSettingsRows`）は `ScrollView` を内包しているが、シート自体の開閉ジェスチャーとは独立して
  おり、スクロール操作とシートを閉じる操作が干渉しうる。

`react-native-reanimated@4.5.0` と `react-native-gesture-handler@~2.32.0` は既に依存に入っている
（将来のジェスチャー対応を見越して先行導入済み）。`@gorhom/bottom-sheet@5` の peer 要件
（`react-native-reanimated: >=3.16.0 || >=4.0.0-`、`react-native-gesture-handler: >=2.16.1`）を
どちらも満たすため、追加の大きな依存なしに導入できる。

## 決定

**`@gorhom/bottom-sheet@^5`** を採用し、`Sheet.tsx` を `BottomSheetModal` ベースへ書き換える。

- **ルート設置**：`src/app/_layout.tsx` に `GestureHandlerRootView`（`react-native-gesture-handler`）と
  `BottomSheetModalProvider`（`@gorhom/bottom-sheet`）をアプリ全体を包む形で設置する。ジェスチャーと
  シートのポータルはツリーの最上位が前提のため。
- **`Sheet` の外部インターフェースは変えない**：既存の `visible` / `title` / `onClose` / `action` /
  `children` / `testID` props をそのまま保つ。内部で `visible` の変化を `BottomSheetModal` の
  `present()` / `dismiss()` 呼び出しに変換し、呼び出し元（`PlanDatePickerSheet` /
  `PlanTextFieldSheet` / `CalendarSettingsRows` の既定カレンダー選択）は無修正で動く。
- **開閉手段**：`enablePanDownToClose` でスワイプダウンを、`backdropComponent`
  （`BottomSheetBackdrop` + `pressBehavior="close"`）で背景タップを有効にする。`onDismiss` を
  `onClose` に接続し、どちらの手段でも同じコールバックへ収れんさせる。
- **サイズ**：`enableDynamicSizing` で中身の高さに追従させる（固定スナップポイントを持たない）。
  中身が長い既定カレンダー選択シートは `BottomSheetScrollView` で内部スクロールとシートの
  ジェスチャーを両立させる。
- **キーボード**：`keyboardBehavior="interactive"` でキーボード追従を `BottomSheetModal` に任せ、
  自前の `KeyboardAvoidingView` は撤去する。
- **シート内の入力欄は `SheetTextInput`（`global/components/ui`）を使う**（`Issue #74` で追加）[確定]：
  中身は react-native の `TextInput` のままにし、シートがキーボードを避けるために要る登録
  （フォーカス中の入力欄のノードを `useBottomSheetInternal` の `animatedKeyboardState.target` に
  出し入れする）だけを自前で行う。ライブラリ提供の `BottomSheetTextInput` は**使わない**。
  あちらは中身が react-native-gesture-handler の `TextInput`（ネイティブのテキストビューを
  `NativeViewGestureHandler` で包んだもの）で、iOS の未確定文字列（marked text）が1打鍵ごとに
  壊れ、日本語のトグル入力・漢字変換ができなくなる。この登録が無いと、シートはキーボード表示
  イベントを保留したまま位置を合わせず、入力欄がキーボードに完全に隠れる。
- **見た目は変えない**：背景色・角丸（`sheet` トークン 28px）・ハンドル（`wheat` 色の横棒）・
  余白は既存デザインを踏襲し、`backgroundStyle` / `handleIndicatorStyle` で同じ値を再現する
  （スコープ外。Issue #58）。

## 結果

- 良い点：ネイティブのシートに近いジェスチャー（スワイプダウン・背景タップ）が揃い、キーボード追従・
  内部スクロールとの両立をライブラリに任せられる。既存の依存（reanimated・gesture-handler）を
  そのまま使い、追加のネイティブ設定はルートのラッパー設置のみで済む。
- 留意点：`BottomSheetModal` はポータル経由で描画されるため、`GestureHandlerRootView` /
  `BottomSheetModalProvider` の設置漏れがあると即座に壊れる（ルート1箇所に集約して防ぐ）。
  ライブラリの API（`present`/`dismiss`）と既存の `visible` props の橋渡しコードが `Sheet.tsx` に
  残り続ける。`SheetTextInput` はライブラリの内部コンテキスト（`useBottomSheetInternal`）に依存する
  ため、`@gorhom/bottom-sheet` の更新時はキーボード状態の形（`animatedKeyboardState`）の変化に注意する。

## 検討した代替案

- **自前実装を維持し `PanResponder`/`Animated` でジェスチャーを足す**：追加依存なしだが、
  スワイプ速度に応じた慣性・キーボード追従・スクロールとの協調をすべて自前で作り込む必要があり、
  対応コストと保守コストが高い。採用しない。
- **`react-native-modal`**：スワイプでの閉じるジェスチャーは持つが、キーボード追従や
  内部スクロールとシートジェスチャーの協調は自前実装のままで、Issue #58 の課題を十分に解決しない。
- **`@devvie/bottom-sheet` 等の軽量シート**：依存は小さいが、動的サイジング・キーボード追従・
  内部スクロールの組み合わせの実績・ドキュメントが `@gorhom/bottom-sheet` に比べて薄い。
