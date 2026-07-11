# CLAUDE.md

chalo — カップルが「いつか一緒に行きたい所・やりたい事」を貯めて共有する iOS アプリ。
React Native + Expo + Supabase。日本語のみ・iOS のみ・ライトモードのみ。

## 最初に読むもの

- `docs/README.md` … ドキュメント全体の目次と「どの文書が何の正か」の一覧
- 機能の実装・変更前に、対象機能の `docs/domain/*.md` と関連 ADR を必ず読む

ドキュメントの責務分離(WHAT = `features.md` / 振る舞い = `domain/` / 実現 = `adr/`)と「一次情報は1か所だけ」のルールは `docs/README.md` を正とする。ここには再掲しない。

## 開発の進め方(イシュー駆動)

- **1 Issue = 1 ブランチ = 1 PR**。main へ直接コミットしない。
- ブランチ名: `feat/<issue番号>-<短い英語スラッグ>`。バグは `fix/`、ドキュメントは `docs/`、それ以外は `chore/`。
- マージは **squash merge**。PR タイトルがそのまま main のコミットメッセージになるため、PR タイトルは `feat: プラン作成を追加` の形式で書く。
- PR 本文に `Closes #<issue番号>` を書き、マージで Issue を自動クローズする。
- Issue・PR・コミットメッセージはすべて日本語。コミットメッセージは `feat:` `fix:` `docs:` `chore:` のプレフィックス + 日本語の要約。

スラッシュコマンド:

| コマンド | 用途 |
|---|---|
| `/create-issue <一文>` | 大まかな要求から質問で詳細を掘り下げ、Issue を起票 |
| `/implement-issue <番号>` | Issue を読み、ブランチ作成→実装→テスト→PR 作成まで実行 |
| `/create-adr <テーマ>` | 既存形式・採番に従って ADR を作成し、目次を更新 |
| `/check-docs` | docs/ の整合性(リンク・重複・目次・保留事項)を検査 |

## コーディング規約(正は各 ADR)

- **ディレクトリ構成・依存方向**: `adr/0015`。`app → features → global` の一方向で、逆流させない。feature 間の直接 import は禁止(相手の `index.ts` バレル経由のみ)。
- **データ層**: `adr/0003`。feature は Repository interface にのみ依存する。supabase-js を import してよいのは `src/global/lib/supabase/` のみ。
- **テスト**: `adr/0014`。計算・判定ロジックは純粋関数に切り出して Jest でテストする。UI・フックの検証は Maestro E2E に委ねる。ロジックを書くときは常に「純粋関数に切り出せるか」を考える。
- **UI**: NativeWind(`adr/0016`)。ライトモードのみ。

## docs の更新ルール

- 技術的な意思決定をしたら ADR に記録する(`/create-adr`)。既存 ADR を覆す場合は旧 ADR を「廃止(superseded)」にする。
- 仕様(状態・条件・タイミング)を変えたら `domain/` を同じ PR で更新する。コードだけ変えて docs を放置しない。
- 未確定事項は勝手に決めない。`[保留]` を付けて `open-questions.md` に登録し、ユーザーに確認する。
- 記述には `[確定]` / `[提案]` / `[保留]` のステータス印を付ける(定義は `docs/README.md`)。

## 品質チェック

- PR 作成前にテスト・lint・typecheck を通す(存在するもののみ)。落ちたまま PR を作らない。
- Supabase の RLS ポリシーに触れる変更は、RLS の自動テストを持たない方針(`adr/0014`)のため、PR で必ずペア境界(自分のペア以外のデータに触れないこと)をレビューで確認する。
