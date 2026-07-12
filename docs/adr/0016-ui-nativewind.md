# ADR-0016: UIスタイリングに NativeWind を採用する

- ステータス: 採用 [確定]
- 関連: adr/0010, adr/0015, features.md, glossary.md
- 参考: NativeWind（https://www.nativewind.dev/）

## コンテキスト

RN + Expo で独自デザイン（チャロくんの世界観・ライトモードのみ）を作る。スタイルの書き方を規約化し、AIにも書かせやすくしたい。StyleSheet 直書きは冗長で、命名やトークンの揺れが出る。コンポーネントキット（Tamagui / gluestack 等）は独自デザインに対して制約と学習コストが大きい。

## 決定

**NativeWind（v4）**を UI スタイリングに採用する。Tailwind のユーティリティクラスを `className` で当てる。

- **スタイリング＝ユーティリティ**：`className` に Tailwind クラスを書く。ビルド時に StyleSheet へコンパイルされ、条件付きスタイルは実行時レイヤが担う。
- **コンポーネントは自作**：ボタン・カード等のプリミティブは `global/components/ui` に自作し、NativeWind でスタイルする（`adr/0015`）。外部コンポーネントキットは採らない。
- **デザイントークンは `tailwind.config` に集約**：色（チャロのブランド色）・間隔・角丸・フォントを定義し、値の直書きを避ける。[確定]
  - **フォントは OS 標準**（`Issue #16`）[確定]：独自フォント（Zen Maru Gothic）は使わず、iOS のシステムフォント（和文はヒラギノ角ゴ、英数字は SF Pro に自動フォールバック）に統一する。`fontFamily` は指定せず、ウェイトのユーティリティ（`font-normal` / `font-medium` / `font-bold` / `font-black`）で階層を表す。フォント読み込み待ちが不要になり、ネイティブアプリらしい表示になる。
  - **角丸は 8px に統一**（`Issue #16`）[確定]：面（カード・ボタン・シート・ダイアログ・入力欄）の角丸は `borderRadius.card`（8px）トークンに集約し、`rounded-card` で当てる。直書きの `rounded-[18px]` 等は使わない。アバター・アイコンボタン・チップ等の円形／ピルは対象外で `rounded-full` を使う。
- **ネイティブの部品・ヘッダーを優先**（`Issue #16`）[確定]：自作で「ネイティブ感」が薄れる箇所は OS 標準に寄せる。戻る／編集／削除は画面内の自作ボタンではなく Expo Router のナビゲーションヘッダー（`Stack.Screen` の `header*` option）に統合する。時刻選択は `@react-native-picker/picker` の iOS ネイティブのホイールピッカーを使う（Claude Design の色・書体に完全一致しない場合があるのは許容）。ナビゲータの option は `className` 不可のため、下記「逃げ道」に従いオブジェクトで書く。
- **ライトモードのみ**：ダークモードの variant（`dark:`）は使わない（`features.md` 10.4）。
- **逃げ道**：ユーティリティで表現しづらい箇所のみ、StyleSheet／インラインを最小限に使う。
- **対象外**：マスコットのアニメーションは Rive（`adr/0010`）が担い、本 ADR の対象外。

セットアップは babel プラグイン・metro 設定・`global.css` 取り込みを行う（NativeWind 標準手順）。

## 結果

- 良い点：スタイルがマークアップの横に並び、部品ごとに完結する（feature-based と相性が良い。`adr/0015`）。Tailwind 語彙は普及しており、AIに書かせやすい。トークンを `tailwind.config` に集約でき、ブランドの一貫性を保てる。StyleSheet へコンパイルされ実行時コストが小さい。
- 留意点：一部の Tailwind ユーティリティは RN で非対応（互換マトリクスに従う）。クラスが長くなりがちなので、繰り返す組み合わせは部品化する。外部コンポーネントを `className` 対応させるには `cssInterop` / `remapProps` が要る。

## 検討した代替案

- **StyleSheet 直書き**：標準だが冗長で、トークン・命名が揺れる。採用しない。
- **Tamagui / gluestack 等のコンポーネントキット**：出来合いの部品は速いが、独自デザインに対して制約が大きく学習コストも高い。ユーティリティで軽く作る。
- **Unistyles**：型安全なスタイルは魅力だが、Tailwind 語彙の普及とAI駆動での書きやすさで NativeWind を採る。
