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
- **アイコンは SF Symbol**（`Issue #28` で更新）[確定]：`expo-symbols` で SF Symbol を直接描画する。当初（`Issue #16`）は Claude Design の手描き SVG をそのまま写した自作アイコン（`global/components/ui/Icon.tsx`）だったが、OS 標準のシステムアイコンに揃えるため置き換えた。呼び出し側の `Icon` コンポーネントのインターフェース（`name`/`size`/`color`）は維持し、内部実装のみ差し替えている。タブバー等の選択状態は `.fill` バリアントへの切り替えで表す。ナビゲーションヘッダーのバーボタン(下記)は `Icon` を介さず SF Symbol 名を直接指定する。
- **デザイントークンは `tailwind.config` に集約**：色（チャロのブランド色）・間隔・角丸・フォントを定義し、値の直書きを避ける。[確定]
  - **フォントは OS 標準**（`Issue #16`）[確定]：独自フォント（Zen Maru Gothic）は使わず、iOS のシステムフォント（和文はヒラギノ角ゴ、英数字は SF Pro に自動フォールバック）に統一する。`fontFamily` は指定せず、ウェイトのユーティリティ（`font-normal` / `font-medium` / `font-bold` / `font-black`）で階層を表す。フォント読み込み待ちが不要になり、ネイティブアプリらしい表示になる。例外として、サインイン画面（A-2）の「chalo」の文字部分のみブランドロゴ的にモノスペースの `Menlo`（iOS 標準搭載フォントのため追加読み込み不要）・`font-normal` を明示指定する（`Issue #37`）。他画面への拡大は対象外。
  - **角丸は Claude Design の使い分けをトークン化**（`Issue #16`）[確定]：面の角丸はデザインの使い分けに忠実に、役割別トークンとして `tailwind.config` の `borderRadius` に定義する（`chip` 10px／`control` 14px／`button` 16px／`field` 18px／`card` 20px／`hero` 22px／`dialog` 24px／`sheet` 28px）。直書きの `rounded-[18px]` 等は使わない。アバター・アイコンボタン・チップ等の円形／ピルは対象外で `rounded-full` を使う。（当初 8px 統一としたが、Claude Design への忠実性を優先して置き換え。`Issue #17`）
  - **rem の実寸は 16px に固定**（`Issue #17`）[確定]：NativeWind の `inlineRem` は既定 14 で、`text-sm`・`px-6` 等の rem 由来ユーティリティが Claude Design の px 指定より 12.5% 縮んで描画される。`metro.config.js` で `inlineRem: 16` を指定し、Web の Tailwind と同じ実寸にする。
- **ネイティブの部品を優先しつつ、戻る／編集／削除はネイティブヘッダーで描く**（`Issue #16`→`Issue #17`→`Issue #28` で更新）[確定]：プラン作成・編集（C-3/D-2）はシートやモーダルではなく、戻るで閉じる通常のプッシュ遷移のフル画面にする（デザイン TURN 5）。時刻選択は `@react-native-picker/picker` の iOS ネイティブのホイールピッカーを使う（Claude Design の色・書体に完全一致しない場合があるのは許容）。戻る／編集／削除は、当初ナビゲーションヘッダー（`Stack.Screen` の `header*` option）への統合とした（`Issue #16`）が、iOS 26 の Liquid Glass ではヘッダーボタンがガラスのカプセルに包まれてデザインと乖離する（編集と削除が1つのカプセルに繋がる）ため、`global/components/ui` の `BackHeader` で画面内に透明の円形ボタンとして描く方式に置き換えた（`Issue #17`）。react-native-screens のバーボタン各アイテムに `sharesBackground: false` を指定してカプセル融合を個別に抑止できるようになったため、`Issue #28` で再びネイティブヘッダー（`Stack.Screen` の `unstable_headerLeftItems`/`unstable_headerRightItems`。`global/utils/headerItems` が組み立てを担う）に統合し、`BackHeader` は廃止した。アイコンは SF Symbol 名を直接指定し（`Icon` コンポーネントは介さない）、iOS 26 未満では `sharesBackground` 等が無視されて通常表示にフォールバックする。バーボタンはネイティブ要素のため `testID` を持てず、E2E（Maestro）からは `accessibilityLabel` を `text` で参照する。戻るスワイプはネイティブのまま有効。ナビゲータの option は `className` 不可のため、下記「逃げ道」に従いオブジェクトで書く。
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
