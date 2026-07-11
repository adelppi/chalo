# chalo (app)

chalo の Expo アプリ本体。ディレクトリ構成・規約は [`docs/adr/0015-directory-structure.md`](../docs/adr/0015-directory-structure.md) を正とする。

## セットアップ

```bash
npm install
npm run ios
```

## スクリプト

- `npm start` … 開発サーバーを起動
- `npm run ios` … iOS シミュレータでビルド・起動
- `npm run lint` … ESLint
- `npm run format` … Prettier で整形
- `npm run typecheck` … 型チェック

## 関連ドキュメント

ルートの [`../CLAUDE.md`](../CLAUDE.md) と [`../docs/README.md`](../docs/README.md) を参照。
