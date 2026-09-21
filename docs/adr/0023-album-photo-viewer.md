# ADR-0023: アルバムは expo-media-library で引き、expo-image のグリッド＋react-native-awesome-gallery のビューワーで見せる

- 関連: domain/album.md, adr/0013, adr/0014, adr/0015, adr/0016, Issue #90

## コンテキスト

`adr/0013` で「アルバム対象日の端末写真を、表示のたびにライブラリから引く」ことは決めた。
残るのは **どう引き、どう見せるか**。求める振る舞いは `domain/album.md`「見かた」で、

- プラン詳細に3列グリッド（Claude Design 6a）
- 1枚を選ぶとフルスクリーンで開き、ズーム・同じ日の他の写真へ横スワイプ・閉じる（同 6b）

iOS の写真は `PHAsset` で、アプリから見える安定したファイルパスを持たない。
**「パスの無い写真」をどう受け渡すか**が、取得・グリッド・ビューワーの3か所すべてを縛る。

## 決定

### 1. 取得は `expo-media-library` の Query API（`exeForMetadata`）

```ts
new Query()
  .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
  .gte(AssetField.CREATION_TIME, from.getTime())
  .lte(AssetField.CREATION_TIME, to.getTime())
  .orderBy({ key: AssetField.CREATION_TIME, ascending: true })
  .exeForMetadata();
```

- **`exeForMetadata()` を使い、`exe()` は使わない。** 前者は媒体ストアから読める範囲だけを返すため軽い。
  後者が返す `Asset.getUri()` は内部で `requestContentEditingInput`（`isNetworkAccessAllowed = true`）を
  呼ぶので、**iCloud「iPhone のストレージを最適化」の端末では対象日の写真を全部ダウンロードしてしまう**。
- 返ってくる `id` は iOS では **`ph://<localIdentifier>`** で、そのまま画像 URI として使える。
  アルバムはこれを写真の同一性としても URI としても使い、URI 解決の段を持たない。
- 日付は `creationTime`（UNIX ミリ秒）で範囲指定する。区間は任意の開始・終了を受け取れる
  （現状の呼び出しは1日ぶんだが、複数日プランへ広げられるようにしておく）。

### 2. グリッドは `expo-image`

- `expo-image` は `ph://` を**そのまま扱える**。PhotoKit のローダーを内蔵し、`contentFit` と
  コンテナサイズから必要な大きさだけを PhotoKit に要求するため、原寸をデコードしない。
- `cachePolicy="none"`。端末ライブラリの写真をアプリのキャッシュに残さない（`adr/0013`）。

### 3. ビューワーは `react-native-awesome-gallery`

- **純 JS**（`react-native-reanimated` + `react-native-gesture-handler`）。どちらも導入ずみで、
  このライブラリ自体はネイティブモジュールを増やさない。
- ピンチ／ダブルタップズーム・横スワイプ・下スワイプで閉じるを持つ。
- **`renderItem` が自由**なので、写真は `expo-image` で描ける（＝ここでも `ph://` がそのまま通る）。
- **クロム（閉じる・カウンター・撮影時刻）は chalo 側で重ねて描く。**
  Claude Design 6b を土台にしており、ライブラリの UI には寄せない
  （6b にあったページドットと「スワイプでその日の他の写真へ」は `Issue #94` で外した）。
- ライブラリ既定の背景は黒。`style={{ backgroundColor: "transparent" }}` で打ち消し、
  下の `bg-ink` を見せる。

### 4. ビューワーの器は `Modal` の `transparent` + `overFullScreen`

`presentationStyle="fullScreen"`（不透明）にすると、**画面下部に絶対配置したクロムが画面上端にも
二重に描かれる**（アクセシビリティツリー上は1つで、見た目だけが重なる）。`transparent` を立てて
`overFullScreen` にすると起きない。背景は中の `View` が `bg-ink` で塗る。

### 5. 純粋ロジックは `album/model` に切り出す（`adr/0014`）

タイル幅の算出・空表示の理由判定・撮影時刻とカウンターの整形を
純粋関数にして Jest でテストする。ビューワーとグリッドの見た目は E2E と手動確認に委ねる。

## 結果

- 良い点
  - URI 解決の段が無い。`ph://` が取得・グリッド・ビューワーを一本で通る。
  - iCloud 最適化ストレージでも、開いた写真だけが PhotoKit 経由で読まれる（全件ダウンロードしない）。
  - ビューワーが純 JS なので、見た目の調整に再ビルドが要らない。デザイン 6b を妥協なく再現できる。
- 留意点
  - `expo-media-library` はネイティブモジュールのため、導入時は再ビルド＋審査提出が要る（`adr/0006`）。
  - `react-native-awesome-gallery` の peer は `react-native-reanimated@^3.2.0` だが、
    **Reanimated 4.5 で動作する**ことをシミュレータで確認した（使っている API がすべて4系に残っている）。
    Reanimated を上げるときはビューワーの回帰確認を行う。
  - `expo-image` を足したときに `expo-modules-core` のパッチが古いと、起動時に dyld の
    `Symbol not found` で落ちる。`npm update expo-modules-core` で SDK 内の最新パッチに揃える。
  - **「写真アプリで開く」導線は持たない。** 特定の1枚にジャンプする公式 API が無く、
    アプリを開くだけの導線は思い出の流れを切るだけなので置かない（`domain/album.md`）。

## 検討した代替案

- **`@nandorojo/galeria`（ネイティブ実装）**：pan-to-close とズームが OS 品質で滑らかな一方、
  **UI が固定でカウンター・撮影時刻・ドットを載せられず**、Claude Design 6b を簡略化する必要があった。
  さらに実機で試したところ `ph://` を扱えず、2か所にパッチが要ることも分かった。
  1つ目は URL の組み立て（`ph://` を `URL(fileURLWithPath:)` に通してしまう）。2つ目は
  `SDWebImageManager.shared` の既定ローダーが `SDWebImageDownloader`（HTTP 専用）で、
  `expo-image` が `SDImageLoadersManager.shared` に登録した PhotoKit ローダーまで届かないこと。
  パッチを当てれば動くことまでは確認したが、デザインを落としたうえに上流パッチを抱える形になるため採らない。
- **`Asset.getUri()` で `file://` に解決してから渡す**：ビューワーの実装を選ばなくなるが、
  上記のとおり iCloud 最適化ストレージで全件ダウンロードを誘発するため採らない。
- **`react-native-image-viewing`**：純 JS で素直だが 2022年4月から更新が止まっており、
  New Architecture での保守リスクを負う。採らない。
- **ビューワーを自前実装**：ズーム・慣性・閉じるジェスチャーを作り込むコストが、
  得られる自由度に見合わない（クロムを重ねられれば足りる）。
