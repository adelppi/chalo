# chalo デザインシステムの使い方

カップル向け iOS アプリ **chalo**（「いつか一緒に行きたい所・やりたい事」を貯めて共有する）の
コンポーネント一式。**ライトモードのみ・日本語のみ・iPhone 幅（390px 前後）**が前提。
文言はすべて日本語で、やわらかい話し言葉（「おしまいにする」「やめておく」「つながる」）。

## セットアップ

**Provider は不要。** どのコンポーネントもそのまま置けば所定の見た目になる。
例外は `ChaloTabBar` だけで、これは safe-area の値を読むため
`SafeAreaInsetsContext.Provider`（バンドルからエクスポート済み）で囲む:

```jsx
<SafeAreaInsetsContext.Provider value={{ top: 0, right: 0, bottom: 34, left: 0 }}>
  <ChaloTabBar state={...} descriptors={...} navigation={...} />
</SafeAreaInsetsContext.Provider>
```

**イベントは React Native 流。`onClick` ではなく `onPress`。** 中身は react-native-web で、
`Button` `IconButton` `Dialog` `Sheet` はすべて `onPress` / `onClose` / `onCancel` を取る。

## スタイルの書き方

Tailwind のユーティリティクラス（NativeWind）。**色・角丸・影は必ず下記のトークン名で書く**
（`#261f19` のような直値や `rounded-[20px]` は使わない）。自分で組むレイアウトの
`div` にもそのまま効く。

| 種類 | クラス |
|---|---|
| 地色 | `bg-linen`（画面背景）`bg-paper`（カード面）`bg-cream`（入力欄）`bg-sand`（区切り線）`bg-wheat`（つまみ・淡い円） |
| 文字 | `text-ink`（本文・見出し）`text-taupe`（二次）`text-stone`（三次・非選択）`text-latte`（プレースホルダ・非活性） |
| 強調 | `bg-plum` / `text-plum`（アクセント）`bg-blush`（plum の淡背景）`bg-camel`（日付・アバター）`bg-rust`（破壊的・エラー） |
| 注意 | `bg-honey-surface` `border-honey-border` `text-honey-text` `text-honey-soft` |
| 透過 | `bg-ink/35`（オーバーレイ）`bg-ink/25`（非活性）`bg-camel/20` のようにスラッシュで指定 |
| 角丸 | `rounded-chip`(10) `rounded-control`(14) `rounded-button`(16) `rounded-field`(18) `rounded-card`(20) `rounded-hero`(22) `rounded-dialog`(24) `rounded-sheet`(28) `rounded-full` |
| 影 | `shadow-card` `shadow-header` `shadow-hero` `shadow-fab` `shadow-toast` `shadow-dialog` `shadow-accent` |
| ウェイト | `font-normal` `font-medium` `font-semibold` `font-bold`（**`font-black` は廃止。使わない**） |

角丸は用途で使い分ける決まりがある（ダイアログ内ボタン=`rounded-control`、画面の CTA=`rounded-button`、
一覧カード=`rounded-card`、ボトムシート上辺=`rounded-sheet`）。迷ったら上の対応表の括弧内の px に近いものを選ぶ。

書体は OS 標準（和文ヒラギノ角ゴ／英数字 SF Pro）。`styles.css` が `html, body` に
`var(--chalo-font-sans)` を当てているので **`font-family` は指定しない**。

className を使えない箇所（SVG の `fill` 等）は CSS 変数を使う: `--chalo-ink` `--chalo-plum`
`--chalo-radius-card` `--chalo-shadow-accent` など（全トークンが `:root` にある）。

## 正の場所

- `_ds/chalo-ds/styles.css` → `_ds_bundle.css` を `@import` している。その先頭に `:root` の
  全トークン、続けて利用可能なユーティリティクラス全部。**クラス名に迷ったらこれを grep する。**
- 各コンポーネントの `components/<group>/<Name>/<Name>.d.ts` が API の正、
  `<Name>.prompt.md` が使い方。

## 組み立て例

```jsx
<div className="bg-linen p-5 flex flex-col gap-4">
  <div className="bg-paper rounded-card p-5 shadow-card flex flex-col gap-2.5">
    <span className="text-[17px] font-bold text-ink">箱根の温泉</span>
    <div className="flex flex-row gap-2">
      <Chip icon="calendar" label="3月14日（金）18:00" />
      <Chip icon="pin" label="箱根" tone="blush" />
    </div>
  </div>
  <Button label="カレンダーに追加" variant="outline" icon="calendar-plus" onPress={...} />
</div>
```

## アイコンについて

`Icon` は iOS の SF Symbols を使っている。**Web プレビューでは lucide の線画で近似している**
ため、実機とは形が違う。`name` は `Icon.d.ts` の `IconName` にある 25 種だけが使える
（`calendar` `clock` `pin` `paw` `check-circle` `gear` `trash` `bell` `lock` など）。
一覧にない絵柄は追加できないので、近いものを選ぶか、アイコンなしで組む。
