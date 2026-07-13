# Maestro E2E テスト

chalo の E2E テストを Maestro で管理。

## テスト構成

- `auth/sign-in-screen-smoke.yaml` … サインイン画面の表示確認（動作確認用）
- `plans/plan-crud.yaml` … プラン CRUD の王道シナリオ（Issue #18・Supabase 実装）
  - 作成（タイトルのみ）→ 一覧反映 → 編集 → 手動おしまい → おしまい一覧 → 削除
- `plans/plan-refresh.yaml` … pull-to-refresh の動作確認（Issue #22）
  - ホーム・プラン詳細・おわったプランの3画面で引っ張って再取得し、既存データの表示が維持されることを確認
- `pairing/pairing-invite-and-errors.yaml` … 招待コード発行・コピー・コード入力エラー（Issue #20・Supabase 実装）
  - 発行 → コピー → own-code エラー → not-found エラー
  - **成立（redeem 成功）は2アカウント同時が必要なため対象外。** RPC・RLS（ペア境界）はレビューで確認する（`adr/0014`・`adr/0017`）

## ローカルでの実行

前提：アプリがサインイン済みであること（Google/Apple の外部認証は自動化しない）。

```bash
# 通常実行（テスト結果のみ）
maestro test .maestro/plans/plan-crud.yaml --device <DEVICE_ID>

# 全フロー実行
maestro test .maestro/

# 動画付きで実行（adr/0014：E2E は実行の動画を記録して格納する）
maestro record --local .maestro/plans/plan-crud.yaml .maestro/recordings/plan-crud.mp4
```

`maestro record --local` は起動中のデバイスが1台なら自動選択される。複数台起動時は対話的に選ぶ。

## 記録について

- **実行動画**：`maestro record --local` で `.maestro/recordings/` に mp4 として保存する（`adr/0014`）。リポジトリにはコミットしない（`.gitignore` で除外・`.gitkeep` のみコミット）。テスト失敗時は動画から画面の動きをたどって原因調査する。
- **コマンドログ・スクリーンショット**：`maestro test --test-output-dir .maestro/recordings` でも取得できる（JSON 形式のコマンド実行記録）。動画と使い分けたい場合に利用する。

## E2E テストの設計（adr/0014）

正常系・異常系を機能単位でカバー。ただし：

- **RLS の自動テストは持たない**：ペア境界のアクセス制御はレビューで担保する（`data-model.md` の `[確定]` 事項）。
- **外部認証（Google/Apple）は自動化しない**：フロー内で自動サインインできないため、本人の手動操作で確認する。

詳細は `.maestro/` ファイルと関連する ADR を参照。
