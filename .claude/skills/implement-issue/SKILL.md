---
name: implement-issue
description: GitHub Issue を起点に、ブランチ作成→実装→テスト→PR 作成までを一気通貫で行う。Issue 駆動開発の実装フェーズで使う。
argument-hint: <Issue番号>
---

Issue 駆動開発の実装フェーズを実行する。対象 Issue: $ARGUMENTS

GitHub の操作は GitHub MCP ツール(リポジトリ: `adelppi/chalo`)で行う。gh CLI がインストールされていれば同等の gh コマンドでもよい。

## 手順

### 1. Issue の理解

1. GitHub MCP の `issue_read` で Issue の本文とコメントを読む。
2. Issue に書かれた関連ドキュメント(`docs/domain/`・`docs/adr/` など)を必ず読む。書かれていなければ `docs/README.md` の一覧から該当文書を探して読む。
3. 受け入れ条件が曖昧、または docs と矛盾している場合は、実装を始める前にユーザーに質問する。

### 2. ブランチ作成

1. 作業ツリーがクリーンであることを確認する。未コミットの変更があれば停止してユーザーに確認する。
2. `git checkout main && git pull` で最新化する。
3. ブランチを切る。命名: `feat/<番号>-<英語スラッグ>`(機能)、`fix/<番号>-…`(バグ)、`docs/<番号>-…`(ドキュメント)、`chore/<番号>-…`(その他)。

### 3. 実装

- CLAUDE.md と関連 ADR の規約(依存方向・配置・テスト戦略)に従う。
- 仕様(状態・条件・タイミング)に触れる変更をしたら、対応する `docs/` も同じ PR で更新する。
- 計算・判定ロジックは純粋関数に切り出し、Jest テストを書く(adr/0014)。

### 4. 検証

- テスト・lint・typecheck を実行して全て通す(存在するもののみ)。
- 結果を正直に報告する。落ちたまま PR を作らない。

### 5. PR 作成

1. コミットして push する。コミットメッセージは日本語で `feat:` 等のプレフィックス付き。
2. `.github/pull_request_template.md` の構成に従って PR 本文を書き、GitHub MCP の `create_pull_request` で PR を作成する。
   - タイトル: `feat: 〇〇を追加` の形式(squash merge でそのまま main のコミットメッセージになる)。
   - 本文に `Closes #<番号>` を必ず入れる。
3. PR の URL と、受け入れ条件それぞれの達成状況を報告する。

## してはいけないこと

- main に直接コミットする。
- マージまで勝手に行う。ユーザーの指示があった場合のみ、GitHub MCP の `merge_pull_request`(merge_method: squash)で行う。
- Issue に書かれていない機能を勝手に足す。気づきがあれば PR 本文への記載や新しい Issue(/create-issue)で提案する。
