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
- **デザイントークンは `tailwind.config` に集約**：色（チャロのブランド色）・間隔・角丸・フォントを定義し、値の直書きを避ける。[提案]
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
