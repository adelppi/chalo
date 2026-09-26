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

テストのルール(何をどちらでテストするか・いつ E2E を流すか・録画)は [`docs/adr/0014-test-strategy.md`](../docs/adr/0014-test-strategy.md) が正。E2E の実行方法と手動チェックリストは [`../.maestro/README.md`](../.maestro/README.md)。

E2E に使う Maestro はスタンドアロンの CLI で、npm パッケージとしては導入しない。バージョンを固定してインストールする(環境間でのブレを防ぐため)。

```bash
export MAESTRO_VERSION=2.6.1
curl -Ls "https://get.maestro.mobile.dev" | bash
maestro --version
```

Claude Code からは Maestro 公式の MCP サーバー(`.mcp.json` の `maestro`)経由でフロー実行・UI 階層取得ができる。

## 関連ドキュメント

ルートの [`../CLAUDE.md`](../CLAUDE.md) と [`../docs/README.md`](../docs/README.md) を参照。
