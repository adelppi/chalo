# ADR-0006: EAS の運用と eas update（OTA）の方針

- ステータス: 採用 [確定]
- 関連: adr/0010（Rive＝Dev Client必須）, non-functional.md

## コンテキスト

EAS、特に **`eas update`** を積極活用したい。AI駆動開発で反復が速いので、ストア審査を待たずにJSの修正を届けられる体制が欲しい。一方、ネイティブ依存（Rive 等）は OTA では更新できない。

## 決定

### ビルド（EAS Build）
- ネイティブモジュール（`rive-react-native`、`expo-calendar`、`expo-notifications`、`expo-media-library`、`expo-haptics` 等）を使うため、**Expo Go ではなく Dev Client / EAS Build** で開発・配布する。
- チャネルを分ける：**`production`** と **`preview`**（社内検証用）。必要なら `development`。

### OTA 配信（eas update）
- **OTAで配信してよいもの**：JS/TSのロジック、UI、文言、アセット（画像）などJSバンドルに含まれる変更。
- **ストアビルドが必要なもの**：ネイティブ依存の追加・更新、権限（Info.plist）変更、Expo SDK のアップグレード、ネイティブ設定の変更。
- **ランタイムバージョン**：`runtimeVersion` は **fingerprint ポリシー**で自動算出する。ネイティブ構成のハッシュが変われば runtimeVersion も変わるため、ネイティブ変更を人が見逃しても非互換な OTA は古いビルドに流れない。
- **チャネル↔ブランチ**：`production` チャネルに本番ブランチ、`preview` に検証ブランチを対応づける。
- **publish は手動のみ**：`eas update` は人が手で実行する。CI からの自動 publish は行わない。
- **ロールバック**：問題のある update は、直前の正常な update を再パブリッシュ（または publish のロールバック）して即時に戻す。
- **シークレット/環境変数**：Supabase の URL/anon key 等は EAS の環境変数・シークレットで管理し、リポジトリに直書きしない。

## 結果

- 良い点：JSレベルの不具合修正・文言調整を審査なしで即配信できる／検証チャネルで安全に試せる。
- 留意点：OTAとストアビルドの境界は fingerprint ポリシーで自動管理されるが、チャネルの使い分け（`preview` で検証してから `production` へ）は人が守る。

## 環境変数・シークレットの登録手順 [確定]

EAS プロジェクトは `eas init` で作成・紐付け済み(`app.json` の `extra.eas.projectId`)。環境変数は EAS Environments(`development` / `preview` / `production`)で管理する。プレーンな値は `plaintext`、機密値は `sensitive` または `secret` を使う(`secret` は登録後に値を参照できない)。

```bash
# 登録(プロジェクト単位・app/ ディレクトリで実行)
npx eas-cli env:create production --name SUPABASE_URL --value "https://xxxx.supabase.co" --visibility plaintext --non-interactive
npx eas-cli env:create production --name SUPABASE_ANON_KEY --value "xxxx" --visibility sensitive --non-interactive
# development・preview にも同様に登録する

# 参照(値の確認。sensitive/secret はデフォルトで値がマスクされる)
npx eas-cli env:list production
npx eas-cli env:list production --include-sensitive

# 削除
npx eas-cli env:delete production --variable-name SUPABASE_URL --variable-environment production --non-interactive
```

ローカル開発時は `npx eas-cli env:pull` で `.env.local` 等に書き出して読み込む(リポジトリにコミットしない。`.gitignore` 済み)。
