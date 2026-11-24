# ADR-0027: 触覚フィードバックは expo-haptics を global/lib/haptics に閉じ込めて鳴らす

- 関連: adr/0003, adr/0006, adr/0014, adr/0015, adr/0021, docs/features.md 10.3, docs/domain/pairing.md, Issue #123

## コンテキスト

`features.md` 10.3 で、触覚フィードバックは作成・手動おしまい・ペア成立・削除の4操作にだけ付けると決まっている。
実装するには、次の3点を決める必要がある。

- どのライブラリで鳴らすか
- feature からどう呼ぶか。`adr/0003` の Repository interface と注入の形に乗せるかどうか
- いつ、どの種類の振動を鳴らすか

## 決定

- **ライブラリは `expo-haptics`**(`adr/0006` で使う前提にしていたもの)。ネイティブモジュールのため、
  導入時に Dev Client の再ビルドが要る。
- **`src/global/lib/haptics/` を唯一の境界にする**。`expo-haptics` を import してよいのはここだけとする。
  feature は意味で名前を付けた API だけを呼び、どの振動パターンで鳴らすかを知らない。
  - `haptics.success()`:作成・手動おしまい・ペア成立。`notificationAsync(Success)`
  - `haptics.destructive()`:削除。`impactAsync(Medium)`。削除に「おめでとう」の感じが出る Success は使わない。
    Warning はエラーに感じられるので使わない
  - 鳴らなくても操作は成立するため、呼び出しの失敗は境界の中で握りつぶし、呼び出し側へ例外を漏らさない。
- **Repository interface にも Provider による注入にもしない**。`global/lib/haptics` を feature から直接 import する。
  トースト(`adr/0021`。`useToastStore` を直接使う)やログ(`global/lib/logging`)と同じ扱いにする。
- **鳴らすのは各 mutation の `onSuccess`**(`usePlanMutations`・`usePairingMutations`)。失敗時は鳴らさない。
  楽観更新は使っていないので、成功が確定した時点で鳴らす。今後、楽観更新を入れる操作があれば、
  ユーザーが操作した時点で鳴らすように見直す。
- **ペア成立はコードを入力した側だけで鳴らす**。招待した側は成立をリアルタイムには検知しない。
  アプリ復帰時などの再取得で初めて知るため、その時点で鳴らしても操作とタイミングが合わない。
- アプリ内にオン・オフの設定は持たない。iOS の「システムの触覚」設定に任せる(オフなら OS 側で鳴らない)。

## 結果

- 良い点:依存の向き(`app → features → global`)を保ち、ネイティブ API を1か所に閉じ込められる。
  操作と振動の種類の対応も1か所で決まる。interface、実装、Provider、合成ルートでの結線を書く手間がない。
- 留意点:注入していないので、フックの単体テストで触覚をモックに差し替える口がない。ただし `adr/0014` では
  フックを Jest で検証しないので、今は困らない。振動はシミュレータでも Maestro でも検証できないため、
  4操作は実機で目視(体感)で確認する。

## 検討した代替案

- **Repository interface と Provider で注入する(ファイル共有の `FileShareRepository` と同じ形)**:
  得られるのは実装の差し替えとモックによる単体テストだが、どちらもこの件では使い道がない。
  iOS のみのアプリで `expo-haptics` 以外の候補はなく、フックのテストも持たない。
  触覚は返り値もドメインデータもない UI への出力で、データを読み書きするための境界である `adr/0003` の対象とも性質が違う。
  二重定義の手間に見合わないので採らない。将来注入が必要になっても、呼び出しの形(`haptics.success()`)は
  変えずに Provider へ移せる。
- **feature から `expo-haptics` を直接呼ぶ**:最も手軽だが、振動の種類の選択が4か所に散らばり、
  ネイティブ API が feature に漏れる。採らない。
- **ボタンを押した時点で鳴らす**:失敗しても鳴ってしまい、「完了した」というフィードバックの意味と合わない。採らない。
- **`react-native-haptic-feedback`**:機能は同等だが、Expo SDK とバージョンを揃えられる `expo-haptics` を優先する。
