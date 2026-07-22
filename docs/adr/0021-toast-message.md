# ADR-0021: 画面下部トーストに react-native-toast-message を採用する

- ステータス: 採用 [提案→要承認]
- 関連: adr/0014, adr/0015, adr/0016, adr/0020, docs/domain/calendar.md, docs/non-functional.md, Issue #62

## コンテキスト

画面下部トースト（F-2）は `global/store/useToastStore.ts`（Zustand・表示状態とタイマー管理）と
`global/components/shared/ToastHost.tsx`（`Modal` を使わない `View` の自前レンダリング）の組で
実装している。この自前実装には次の課題がある。

- **閉じる手段がタイムアウト（2.5秒）のみ**：ユーザーが手動で閉じる操作を持たない。
  `PanResponder`/`Animated` でスワイプ検出を自作すると、ジェスチャーの減衰・キャンセル・
  複数トーストの後勝ち上書きとの整合をすべて自前で作り込む必要がある（`adr/0020` で
  `Sheet.tsx` に同種の課題があり `@gorhom/bottom-sheet` を採用した判断と同型）。
- **表示・非表示のタイマー管理を自前で持つ**（`hideTimer` のクリア・再設定）。ライブラリが
  肩代わりできる定型処理。

## 決定

**`react-native-toast-message@^2.4`** を採用し、`useToastStore` の内部実装のみ置き換える。

- **呼び出し側 API は無変更**：`useToastStore((state) => state.show)` のファサードを維持し、
  内部で `Toast.show({ type, text1, props: { icon }, visibilityTime })` を呼ぶだけにする
  （`global/store/useToastStore.ts`）。呼び出し側8ファイルは無修正。
- **見た目は custom config で完全再現**：`global/lib/toast/toastConfig.tsx` に `default` /
  `error` の2バリアントを定義し、既存の角丸ピル（`rounded-full` `bg-ink`/`bg-rust`・`Icon`・
  `linen`/`paper` 文字・`shadow-toast`）をそのまま NativeWind の `className` で再現する。
  ライブラリ標準の見た目（success/error/info の白背景カード）は使わない。
- **ルート設置**：`src/app/_layout.tsx` に `<Toast config={toastConfig} position="bottom"
  bottomOffset={insets.bottom + 96} />` を1つ置き、旧 `ToastHost` は撤去する。
  `useSafeAreaInsets()` は Expo Router がルートに敷く `SafeAreaProvider` に乗って呼べる
  （既存の `ToastHost` でも同じ前提で動いていた）。
- **スワイプで閉じる（新規）**：`react-native-toast-message@2.4` は `swipeable`
  （既定値 `true`）でスワイプジェスチャーを標準搭載しており、追加実装なしで要件を満たす。
- **後勝ち上書き**：`Toast.show()` は表示中でも新しい呼び出しでキューせず即座に内容を差し替える
  ライブラリ既定の挙動で、自前実装の「後勝ち」と同じ。

## 結果

- 良い点：スワイプ閉じ・タイマー管理・後勝ち上書きをライブラリに任せられ、`useToastStore` から
  タイマー管理コードが消える。`config` prop でレンダリングを完全に差し替えられるため、
  デザイントークン（`tailwind.config.js`）をそのまま使い続けられる。ライブラリは 2026-07 時点でも
  更新が続いている。
- 留意点：ライブラリの内部レイアウト（`AnimatedContainer` の `position: absolute; left: 0;
  right: 0; alignItems: center`）に依存するため、以前の `left-6 right-6`（画面幅 - 48px の
  折り返し幅）は `toastConfig` 側の `px-6` ラッパーで明示的に再現している。ライブラリの
  メジャーバージョン更新（3.x 系はベータ）でこの内部構造が変わった場合、`toastConfig.tsx` の
  折り返し幅の再現を見直す必要がある。

## 検討した代替案

- **自前実装を維持し `PanResponder`/`Animated` でスワイプを足す**：追加依存なしだが、
  ジェスチャーの減衰・キャンセル・キューイングをすべて自作する必要があり、`adr/0020` で
  `Sheet.tsx` について検討し却下した理由と同型のコストがかかる。採用しない。
- **`react-native-flash-message`**：同様に `config` ベースでカスタムレイアウトを差し込めるが、
  スワイプでの手動クローズを標準搭載せず、直近の公開が 2023-08 で更新が止まっている。採用しない。
- **`react-native-root-toast`**：API がシンプルで軽量だが、Android ネイティブ Toast 由来の
  UI 前提が強く、角丸ピル・アイコン・2バリアントの独自デザインを `config` のような差し込み口で
  再現する手段を持たない。採用しない。
