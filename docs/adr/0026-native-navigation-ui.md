# ADR-0026: ナビゲーション UI を iOS 純正に寄せる

- 関連: adr/0002, adr/0016, Issue #106, Issue #107

## コンテキスト

下部のタブバーは、デザイン（Claude Design の C-1a 下部）を写した自作コンポーネント（`ChaloTabBar`）を expo-router の `Tabs` の `tabBar` に差し込んで描いていた。紙色の背景に上罫線の平たいバーで、iOS 26 のリキッドグラスにはならない。一方、詳細・作成・編集の戻る／編集／削除はすでに純正のネイティブヘッダーで描いており（`adr/0016`・`Issue #28`）、iOS 26 ではガラスのボタンになる。同じアプリの中で、上のバーは OS の質感、下のバーは自作の平面、と質感が揃っていなかった。

タブ画面（プラン・おわったプラン・設定）の見出しも、画面内に 38px の `Text` で描いており、スクロールしても縮まない。

自作タブバーはデザインに忠実な反面、OS が標準で提供する振る舞い（リキッドグラス、押下時の反応、アクセシビリティ、今後の OS 更新への追従）をすべて自前で持たないといけない。浮遊するバーがタップを横取りする問題も E2E で起きていた。

## 決定

**ナビゲーションの枠（タブバー・ナビバー・見出し）は iOS 純正の部品で描き、デザインモックとの差はコードの側を正とする。**

1. **下部タブバーは expo-router の `NativeTabs`（`expo-router/unstable-native-tabs`）で描く。** react-native-screens の Tabs を通じて UIKit の `UITabBarController` そのものが出るため、iOS 26 ではリキッドグラスのタブバーになる。
   - アイコンは SF Symbol（`pawprint` / `checkmark.circle` / `gearshape`）で、選択中は `.fill` にする（`adr/0016` のアイコン方針と同じ）。色は選択中 `ink`・非選択 `stone`。
   - スクロールでの最小化（iOS 26 の `minimizeBehavior`）はしない（`never`）。タブが3つだけなので常に見えている方が分かりやすく、ホームの追加ボタンとの位置関係も安定する。
   - 各タブに `testID`（`tab-plans` / `tab-done` / `tab-settings`）を付ける。iOS では UITabBarItem の accessibilityIdentifier になり、Maestro から従来どおり引ける。
   - 自作の `ChaloTabBar` は削除する。
2. **ホームの追加ボタン（FAB）は `expo-glass-effect` の `GlassView`（`isInteractive`）で描くリキッドグラスの丸ボタンにする。** 押下時の反応はネイティブのガラスに任せる。`isLiquidGlassAvailable()` が偽の環境（iOS 26 未満）では、従来の黒い丸ボタンで描く。
   - NativeTabs は各タブの中身に `SafeAreaProvider` を敷くため、タブ画面の `useSafeAreaInsets().bottom` はタブバーの高さを含む。FAB はこれを基準にしてバーの上に浮かせる。
3. **タブ画面の見出しは純正の largeTitle（`headerLargeTitleEnabled`）にする**（`Issue #107`）。詳細・作成・編集は画面内の見出しを残し、スクロールしたときナビバーに小さなタイトルを出すだけにとどめる。
   - NativeTabs のタブはヘッダーを持たないため、各タブをグループ（`(plans)` / `(done)` / `(settings)`）にしてスタックを1つずつ持たせる。グループ名は URL に出ないので、パスは `/`・`/done`・`/settings` のまま変わらない。ヘッダー設定は `global/utils/headerItems` の `largeTitleHeaderOptions` に集約する。
   - ヘッダーは透明（`headerTransparent`）にして画面の linen になじませ、スクロールで縮んだ後は iOS 26 のスクロールエッジ効果（ぼかし）に任せる。
   - 大タイトルをスクロールに連動させるには、ScrollView を画面ルートの最初の子に置き、`contentInsetAdjustmentBehavior="automatic"` を付け、ルートの View に `collapsable={false}` を付ける。`collapsable={false}` が無いと、背景色のある View でも連動しなかった（UIKit が最初の子の連鎖で ScrollView を見つけられないため。Expo の NativeTabs ドキュメントにも同じ注意がある）。読み込み中・空状態でも ScrollView を出したままにし、中身だけを切り替える。
   - 詳細・作成・編集の小さなタイトルは、画面内の見出しの下端を越えてスクロールしたかどうか（純粋関数 `isHeadingScrolledPast`）で出し分ける。
4. **デザインモックとの差の扱い**：上記によって、タブバーの見た目（背景・罫線・ラベルの書体）、FAB の色、見出しの大きさは、Claude Design のモックと一致しなくなる。ナビゲーションの枠についてはコードの側を正とし、モックは更新しない。画面の中身（カード・行・文言）は、これまでどおりモックを正とする。

## 結果

- 良い点：上下のバーがともに OS の質感になり、iOS 26 らしい見た目で揃う。押下の反応・アクセシビリティ・大きな文字サイズへの対応などを OS から無償で得られ、今後の OS 更新にも自動で追従する。自作タブバーのコードと、その保守が消える。
- 留意点：`NativeTabs` は expo-router の `unstable` API のため、expo-router を上げたときの破壊的変更に注意する。タブバーの細部（ラベル書体・高さ・背景）はほぼ調整できない。純正のタブバーはガラスで下に中身が回り込むため、画面下端に置く要素（FAB・トースト）はタブバーの高さを考慮した位置にする必要がある。モックと実装がずれるため、ナビゲーションの見た目を確認するときはモックではなく実機（シミュレータ）を見る。

## 検討した代替案

- **自作タブバーを残し、背景だけ `GlassView` にする**：独自のアイコン・レイアウトは保てるが、iOS 26 の純正タブバーが持つ振る舞い（選択中の項目を包むガラスのレンズ、押下時の伸び縮み、大きな文字での長押し表示）は再現できず、質感が純正に劣る。見た目を真似るほど OS 更新への追従コストも増える。採用しない。
- **React Navigation の `@bottom-tabs/react-navigation`（react-native-bottom-tabs）を直接使う**：同じく純正の UITabBar を出せるが、expo-router のファイルベースルーティングとは別に結線が要り、`adr/0002` の「Expo Router に乗る」方針から外れる。expo-router 同梱の `NativeTabs` が同等のことをできるため採用しない。
- **モックも実装に合わせて更新する**：一次情報を揃えられるが、デザインファイルは 256 KiB の上限で書き戻すと末尾が欠けるため、現状は安全に更新できない。ナビゲーションの枠は OS が描くものなのでモックに再現する価値も低い。採用しない。
