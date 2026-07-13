# Maestro E2E テスト

chalo の E2E テストを Maestro で管理。

## テスト構成

- `auth/sign-in-screen-smoke.yaml` … サインイン画面の表示確認（動作確認用）
- `plans/plan-crud.yaml` … プラン CRUD の王道シナリオ（Issue #18・Supabase 実装）
  - 作成（タイトルのみ）→ 一覧反映 → 編集 → 手動おしまい → おしまい一覧 → 削除

## ローカルでの実行

前提：アプリがサインイン済みであること（Google/Apple の外部認証は自動化しない）。

```bash
cd app

# 単一フロー実行
maestro test ../.maestro/plans/plan-crud.yaml --device <DEVICE_ID>

# 全フロー実行
maestro test ../.maestro/

# テスト記録を output/ に保存（コマンド JSON・ログ・スクリーンショット）
maestro test ../.maestro/plans/plan-crud.yaml --device <DEVICE_ID> --test-output-dir ../.maestro/recordings
```

## 記録について

- **ローカル検証時**：`maestro test --test-output-dir` でコマンドログ・スクリーンショット・実行記録 JSON を `recordings/` に格納。リポジトリにはコミットしない（`adr/0014` の方針）。
- **CI 環境での実行**：Maestro Cloud または EAS Simulator での動画自動記録を別途実装（運用上必要に応じて検討）。

## E2E テストの設計（adr/0014）

正常系・異常系を機能単位でカバー。ただし：

- **RLS の自動テストは持たない**：ペア境界のアクセス制御はレビューで担保する（`data-model.md` の `[確定]` 事項）。
- **外部認証（Google/Apple）は自動化しない**：フロー内で自動サインインできないため、本人の手動操作で確認する。

詳細は `.maestro/` ファイルと関連する ADR を参照。
