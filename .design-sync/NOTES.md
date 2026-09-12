# design-sync メモ（chalo）

このリポジトリ固有のハマりどころ。次回の同期はここを先に読む。

## 前提：chalo は Web のデザインシステムではない

chalo は React Native + Expo の **iOS アプリ**で、ブラウザで動く DS パッケージではない。
そのため `.design-sync/web/` に **react-native-web 向けのビルドアダプタ**を置き、
その出力（`dist/index.cjs` + `dist/types/` + `dist/ds.css`）をコンバータに食わせている。
**`app/src` のコンポーネント実装には一切手を入れていない** — 差し替えているのは
プラットフォーム層（`react-native` → `react-native-web`、`expo-symbols` → SVG スタブ）だけ。

- ビルド: `node .design-sync/web/build.mjs`（`cfg.buildCmd`）。
  esbuild バンドル → `tsc` で型 → 語彙/トークン生成 → Tailwind CSS、の 4 段。
- `.design-sync/web/` のうち `node_modules/` と `dist/` は gitignore。
  `build.mjs` `gen-*.mjs` `src/` `stubs/` `tailwind.config.js` `tsconfig.build.json` `package.json` は**コミットする**。
- 新しいクローンでは `cd .design-sync/web && npm i` が必要。

## ハマった点（再発しやすい順）

- **CJS 出力でないと動かない。** `format: "esm"` + `external: react` にすると、
  CJS 依存の `require("react")` が esbuild の `__require` に化けて実行時に
  `Dynamic require of "react" is not supported` で全プレビューが落ちる。
  design-sync 側の react shim は静的 import しか拾えない。`format: "cjs"` が正。
- **`react-native-web` の `<style id="react-native-stylesheet">` が誤判定を起こす。**
  `package-validate.mjs` は `[id^="r"]` の最初の要素を「描画ルート」とみなすため、
  head に挿入されるこの style 要素（中身は CSSOM 直挿しで空）を掴んで
  全コンポーネントが `[RENDER] root empty` になる。`build.mjs` で id を
  `ds-rnw-stylesheet` に置換して回避している。rnw 更新でこの文字列が変わると
  build.mjs が明示的に落ちるようにしてある。
- **パッケージの二重解決で React Context が壊れる。** `app/node_modules` と
  `.design-sync/web/node_modules` の両方から同じパッケージが入ると Context の
  同一性が失われる。`react-native-safe-area-context` が二重になり
  `ChaloTabBar` が「No safe area value available」で落ちた。`build.mjs` の
  `DEDUPE` 配列（safe-area-context / react-native-css-interop / nativewind）で固定。
  **依存を足したら `dist/meta.json` で重複チェックをやり直すこと。**
- **Tailwind は JIT なので `app/src` に出ないクラスは CSS に入らない。**
  デザインエージェントは自分でレイアウトを書くため、`gen-vocabulary.mjs` が
  トークン由来 + 汎用レイアウトの約 1,400 クラスを `src/_vocabulary.txt` に列挙し、
  Tailwind の content に食わせている。**パレットや角丸を足したら再生成される**
  （palette.js / tailwind.config.js を読んでいるので自動）。
- **NativeWind の Web 出力は `NATIVEWIND_OS` 未設定が条件。** 設定されていると
  native プリセットになり、標準 CSS が出ない。`build.mjs` が明示的に空で渡している。
- **`cfg.tokensGlob` は単体では効かない。** コンバータの `copyTokens` は
  `cfg.tokensPkg`（node_modules 配下のパッケージ名）が無いと即 return する。
  chalo にはトークンパッケージが無いので、`gen-vocabulary.mjs` が作る
  `dist/tokens.css` を **`build.mjs` が `dist/ds.css`（= cssEntry）の先頭に畳み込んでいる**。
  デザインに届くのは `styles.css` の `@import` closure だけなので、これで確実に届く。
  `ds-bundle/tokens/` が空なのは想定どおり。**`tokensGlob` を設定に戻さないこと。**
- **Babel は不要。** esbuild の `jsx: automatic` + `jsxImportSource: "nativewind"` で
  className が `react-native-css-interop` の jsx runtime を通り、web では
  `style={{$$css:true,...}}` 経由で RNW が DOM の class に落とす。

## ブラウザ（描画検証）

playwright の chromium は**ダウンロードしていない**。`playwright` パッケージだけ入れ、
既存の Chrome を使う:

```sh
DS_CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  node .ds-sync/package-validate.mjs ./ds-bundle
```

`package-capture.mjs` も同じ環境変数で動く。付け忘れると `[RENDER_SKIPPED]` になる。

## Known render warns（既知・対処不要）

- `[RENDER_THIN] components/global/Dialog/Dialog.html: DOM content present but rendered height is 0px`
  — `Dialog` は RN の `Modal`。react-native-web では body 直下へ portal して
  fixed 配置になるため、マウント先の実測高さが 0 になる。描画自体は正常
  （`_screenshots/review/global__Dialog.png` で確認済み）。

## 対象範囲

- 同期しているのは 10 個: Avatar / Button / Chip / Dialog / Icon / IconButton / Sheet
  （`components/global/`）、ChaloFace / PawPrint / ChaloTabBar（`components/shared/`）。
- `SafeAreaInsetsContext` はバンドルには入れているが `componentSrcMap` で
  コンポーネント一覧から除外している。`ChaloTabBar` が `useSafeAreaInsets` を
  読むため、`cfg.provider` から insets を差し込むためだけのエクスポート。
- `Sheet` は `@expo/ui/community/bottom-sheet` だが、**Web 実装（vaul）を持っていた**ので
  そのまま描画できている。ネイティブ専用だと決めつけない。

## アイコンについて（既知の非忠実点）

`expo-symbols`（SF Symbols）は Apple のシステムリソースでブラウザに存在しない。
`.design-sync/web/stubs/expo-symbols.tsx` が **lucide(MIT)** の線画で近似している
（対応表は `gen-symbols.mjs` の `MAP`）。

- `alert-circle` の palette 表示（塗り円 + 抜き文字）だけは近似ではなく同じ構造で描いている。
- `.fill` バリアント（pawprint / checkmark.circle / gearshape）は、線画で塗りを
  再現できないため**線を太くして**選択状態を表している。実機の SF Symbols とは見え方が違う。
- **iOS 実機のアイコンが正**。Web プレビューのアイコン形状を実装の根拠にしないこと。

## アップロード先

- プロジェクト: 「chalo デザインシステム」
  https://claude.ai/design/p/6d017ca4-a674-4cb6-9759-01c7405b1f5c
  （`cfg.projectId` に記録済み。再同期はここから `_ds_sync.json` を取って差分を出す）
- 初回同期: 10 コンポーネント / 32 セル / 58 ファイル。

## Re-sync risks（次回これが静かに腐る）

- **lucide のアイコン名**: `gen-symbols.mjs` の `MAP` は lucide のアイコン名を直接参照している。
  lucide-static を上げるとリネーム・削除でビルドが落ちる（落ちるので気づける）。
- **`react-native-stylesheet` の id 置換**: rnw が実装を変えると build.mjs が落ちる（意図的）。
- **`Icon.tsx` の `IconName` を増やしたとき**: `gen-symbols.mjs` の `MAP` に
  SF Symbol → lucide の対応を足さないと、そのアイコンだけ**黙って何も描画されない**
  （`SF_INNER[name]` が undefined で `null` を返す）。Icon を増やしたら必ず対応を足す。
- **`app/tailwind.config.js` のトークン追加**: 語彙とトークン CSS は自動で追いつくが、
  `.design-sync/conventions.md` の色一覧は手書きなので追従が必要。
- **`ChaloFace` は 9 フレーム・約 3 秒ループの GIF**。キャプチャのタイミングで
  掴むフレームが変わるため、見た目が毎回わずかに違う（顔の表情の揺れ。欠けではない）。
- **プレビューの `ChaloTabBar` は react-navigation の state を手で組んでいる**。
  `ChaloTabBar` が `descriptors`/`navigation` の別フィールドを読むようになったら
  プレビューを直す必要がある。
- **未検証**: ホバー・スワイプ・キーボード回避などの操作は静的プレビューでは確認していない。
