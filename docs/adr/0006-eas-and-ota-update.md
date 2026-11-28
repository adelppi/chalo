# ADR-0006: EAS の運用と eas update（OTA）の方針

- 関連: non-functional.md, adr/0025, adr/0028, Issue #130

## コンテキスト

EAS、特に **`eas update`** を積極活用したい。AI駆動開発で反復が速いので、ストア審査を待たずにJSの修正を届けられる体制が欲しい。一方、ネイティブ依存は OTA では更新できない。

ソロ開発で、配信前の確認は手元の Release 構成のビルドで足りている。ストア版も EAS のサーバーではなく手元の `eas build --local` でビルドしている。

## 決定

### ビルド
- ネイティブモジュール（`expo-calendar`、`expo-notifications`、`expo-haptics` 等）を使うため、**Expo Go ではなく Dev Client** で開発する。
- **ストア版は手元でビルドする**（`eas build --local --platform ios --profile production`）。EAS のサーバービルドは使わない。
- ビルド番号は EAS の remote 管理・自動採番に任せる（`eas.json` の `appVersionSource: "remote"` と production の `autoIncrement: true`。`adr/0025`）。

### OTA 配信（eas update）
- **OTAで配信してよいもの**：JS/TSのロジック、UI、文言、アセット（画像）などJSバンドルに含まれる変更。
- **ストアビルドが必要なもの**：ネイティブ依存の追加・更新、権限（Info.plist）変更、Expo SDK のアップグレード、ネイティブ設定の変更、バージョン（`package.json` の `version`）の変更、`eas.json` の変更（いずれも fingerprint に含まれ、runtimeVersion が変わる）。
- **チャネルは `production` だけ**。`eas.json` の production プロファイルに `channel: "production"` と `environment: "production"` を書き、EAS 上の同名のブランチに対応づける。`preview` チャネルは持たない（配信前の確認は手元の Release 構成のビルドで行うため）。
- **設定**：`expo-updates` を入れ、`app.json` に `updates.url`（`https://u.expo.dev/<projectId>`）と `runtimeVersion: { "policy": "fingerprint" }` を書く。`app.config.ts` があるため `eas update:configure` の自動書き込みには頼らず、手で書く。
- **ランタイムバージョン**：fingerprint ポリシーで自動算出する。ネイティブ構成のハッシュが変われば runtimeVersion も変わるため、ネイティブ変更を人が見逃しても非互換な OTA は古いビルドに流れない。
- **publish は手動のみ**：`eas update` は人が手で実行する。CI からの自動 publish は行わない。main にマージ済みのコミットからだけ配信する（`adr/0028`）。
- **ロールバック**：問題のある update は、直前の正常な update を再パブリッシュ（または publish のロールバック）して即時に戻す。
- **シークレット/環境変数**：Supabase の URL/anon key 等は EAS の環境変数・シークレットで管理し、リポジトリに直書きしない。

### fingerprint の照合

手元のビルドは EAS にビルドとして記録されないため、`eas fingerprint:compare --build-id` で配信先のストア版と比べることができない。代わりにハッシュを人が控えて比べる。

1. ストア版をビルドしたコミット（= そのバージョンのタグ。`adr/0025`）で、ハッシュを生成して控える。

   ```bash
   npx eas-cli fingerprint:generate --platform ios --environment production
   ```

2. OTA を出す前に、配信するコミットで控えたハッシュと比べる。一致しなければ OTA は届かないので、ストア版として出す。

   ```bash
   npx eas-cli fingerprint:compare <控えたハッシュ>
   ```

3. 一致したら配信する。

   ```bash
   npx eas-cli update --channel production --environment production --message "<変更の要約>"
   ```

**バージョンを上げた後の main からは、前のストア版に OTA が届かない。** fingerprint は解決後のアプリ設定を含み、`version` もその一部だからである。次のストア版のバンプ PR をマージした後は、前のストア版への OTA は出せない（出すなら、バンプより前の main から）。

## 結果

- 良い点：JSレベルの不具合修正・文言調整を審査なしで即配信できる。チャネルが1つなので、どこへ配信したかで迷わない。
- 留意点
  - 配信前に OTA そのもの（EAS から落ちてくるバンドル）を試す場所が無い。手元の Release 構成のビルドで JS を確かめてから出す。届いたものに問題があればロールバックで戻す。
  - fingerprint の照合は人の手順に依存する。忘れても非互換な OTA が古いビルドに流れることはない（runtimeVersion が違うため届かないだけ）が、「出したのに届かない」になる。
  - `expo-updates` は更新の確認のため、起動時に Expo のサーバーへ通信する。送る情報はプライバシーポリシーに書く（`docs/legal/privacy.html`、`adr/0028`）。

## 検討した代替案

- **`preview` チャネルを持ち、検証してから `production` へ**: 配信される実物を試せるが、試すための端末側のビルド（preview チャネルを向いたビルド）を別に持ち続けることになる。ソロ開発で利用者が少ないうちは、手元の Release ビルドで確かめ、問題はロールバックで戻すほうが軽い。
- **EAS のサーバーでストア版をビルドする**: `--build-id` で fingerprint を照合でき、手順が1つ減る。ただしビルドの待ち時間・無料枠の制約があり、今の手元ビルドの運用を変えるほどの理由にならない。

## 環境変数・シークレットの登録手順

EAS プロジェクトは `eas init` で作成・紐付け済み(`app.json` の `extra.eas.projectId`)。環境変数は EAS Environments(`development` / `preview` / `production`)で管理する。プレーンな値は `plaintext`、機密値は `sensitive` または `secret` を使う(`secret` は登録後に値を参照できない)。

```bash
# 登録(プロジェクト単位・app/ ディレクトリで実行)
npx eas-cli env:create production --name EXPO_PUBLIC_SUPABASE_URL --value "https://xxxx.supabase.co" --visibility plaintext --non-interactive
npx eas-cli env:create production --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "xxxx" --visibility sensitive --non-interactive
# development・preview にも同様に登録する

# 参照(値の確認。sensitive/secret はデフォルトで値がマスクされる)
npx eas-cli env:list production
npx eas-cli env:list production --include-sensitive

# 削除
npx eas-cli env:delete production --variable-name EXPO_PUBLIC_SUPABASE_URL --variable-environment production --non-interactive
```

変数名は `EXPO_PUBLIC_` プレフィックス付き(`EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`)とする。クライアントサイド(アプリの JS バンドル)から参照する値は Expo の規約上このプレフィックスが必須なため(`app/src/global/lib/supabase/client.ts` から `process.env.EXPO_PUBLIC_*` として参照)。`EXPO_PUBLIC_*` はバンドル時に埋め込まれるため、`eas update` でも `--environment production` を付けて同じ値を入れる。

ローカル開発時は `npx eas-cli env:pull development` で `.env.local` に書き出して読み込む(リポジトリにコミットしない。`.gitignore` 済み)。
