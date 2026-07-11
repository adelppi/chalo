# chalo (app)

chalo の Expo アプリ本体。ディレクトリ構成・規約は [`docs/adr/0015-directory-structure.md`](../docs/adr/0015-directory-structure.md) を正とする。

## セットアップ

```bash
npm install
npx eas-cli env:pull development  # .env.local に Supabase の URL/anon key を書き出す
npm run ios
```

Supabase の URL / anon key は EAS Environments(`development` / `preview` / `production`)で管理する(`docs/adr/0006-eas-and-ota-update.md`)。ローカル開発では `.env.local` に書き出して読み込む(リポジトリにコミットしない)。

## スクリプト

- `npm start` … 開発サーバーを起動
- `npm run ios` … iOS シミュレータでビルド・起動
- `npm run lint` … ESLint
- `npm run format` … Prettier で整形
- `npm run typecheck` … 型チェック
- `npm test` … ロジックテスト(Jest)

## テスト

テスト戦略の正は [`docs/adr/0014-test-strategy.md`](../docs/adr/0014-test-strategy.md)。

### ロジックテスト(Jest)

```bash
npm test
```

純粋関数・ユーティリティのみを対象にする。UI・フックのテストは書かない(E2E に委ねる)。

### E2E テスト(Maestro)

Maestro はスタンドアロンの CLI で、npm パッケージとしては導入しない。バージョンを固定してインストールする(チーム・CI 間でのブレを防ぐため)。

```bash
export MAESTRO_VERSION=2.6.1
curl -Ls "https://get.maestro.mobile.dev" | bash
maestro --version
```

フローは `.maestro/` 配下に機能ごとのサブフォルダで配置する(例: `.maestro/auth/`)。要素特定は `testID`(accessibility identifier)を使う。命名規則は `docs/adr/0014-test-strategy.md` を参照。

```bash
maestro test .maestro/auth/sign-in-screen-smoke.yaml
```

失敗時に画面の動きから原因をたどれるよう、フロー内で `startRecording` / `stopRecording` を使って録画する(`adr/0014`)。出力先は `--test-output-dir` でローカルの `.maestro/recordings/` を指定する(`.gitignore` 対象。リポジトリにはコミットしない)。

```bash
maestro test --test-output-dir .maestro/recordings .maestro/auth/sign-in-screen-smoke.yaml
```

Claude Code からは Maestro 公式の MCP サーバー(`.mcp.json` の `maestro`)経由でフロー実行・UI 階層取得ができる。

## 関連ドキュメント

ルートの [`../CLAUDE.md`](../CLAUDE.md) と [`../docs/README.md`](../docs/README.md) を参照。
