---
name: merge-pr
description: レビュー済みの PR を squash merge し、リモートとローカルのブランチを削除して main を最新にする。
argument-hint: <PR番号>(省略時は現在のブランチの PR)
---

対象 PR: $ARGUMENTS

PR を squash merge して後片付けまで行う。ブランチ運用の正は `CLAUDE.md`(1 Issue = 1 ブランチ = 1 PR / squash merge)。

GitHub の操作は GitHub MCP ツール(リポジトリ: `adelppi/chalo`)で行う。gh CLI がインストール・認証済みであれば同等の gh コマンドでもよい。

## 手順

### 1. 対象 PR の特定

1. 引数に番号があればそれを使う。
2. 無ければ `git rev-parse --abbrev-ref HEAD` で現在のブランチ名を取り、GitHub MCP の
   `list_pull_requests`(`head: adelppi:<ブランチ名>`, `state: open`)で PR を探す。
3. 見つからない・複数ある場合は停止してユーザーに確認する。

### 2. マージ前のチェック

GitHub MCP の `pull_request_read` で確認する。

1. `get` … `state` が open、`draft` が false、`mergeable` が true(`mergeable_state` が
   `dirty` = コンフリクトなら停止)。
2. タイトルが `feat: 〇〇を追加` の形式(`feat:` `fix:` `docs:` `chore:` + 日本語)であること。
   squash merge でそのまま main のコミットメッセージになるため、崩れていたら停止して
   タイトルの修正を提案する(`update_pull_request` で直せる)。
3. 本文に `Closes #<Issue番号>` があること。無ければ停止して確認する
   (リリース作業など Issue に紐づかない PR ならそのまま進めてよい)。
4. `get_reviews` … `CHANGES_REQUESTED` が未解決なら停止する。
5. `get_check_runs` … 失敗している check があれば停止する(チェックが無ければそのまま進む)。
6. Supabase の RLS ポリシーに触れる PR は、`get_files` で差分を見てペア境界
   (自分のペア以外のデータに触れないこと)を確認してから進む(`CLAUDE.md` 品質チェック)。

問題がなければ確認を取らずにマージへ進む。**止まるのは上のいずれかに引っかかった時だけ**。

### 3. squash merge

GitHub MCP の `merge_pull_request` を使う。

- `merge_method`: `squash`
- `commit_title`: `<PRタイトル> (#<PR番号>)`(例: `feat: プラン作成を追加 (#101)`)
- `commit_message`: 空文字列(PR 本文や個別コミットの羅列を main に持ち込まない)

### 4. ブランチ削除と後片付け

1. 作業ツリーがクリーンなことを確認する。未コミットの変更があればここで停止し、
   ブランチは消さずにユーザーに確認する(マージ自体は済んでいる旨を伝える)。
2. `git push origin --delete <ブランチ名>` でリモートブランチを削除する。
   リポジトリ設定で自動削除済みの場合は `remote ref does not exist` になるが、それは正常。
3. `git checkout main && git pull` で main を最新にする。
4. `git branch -D <ブランチ名>` でローカルブランチを削除する。
   squash merge では main と履歴が繋がらず `-d` は失敗するため `-D` を使う
   (PR がマージ済みであることを手順 3 で確認しているので安全)。
5. `git fetch --prune` で消えたリモート追跡ブランチを整理する。

### 5. 報告

1. `git log -1 --pretty='%h %s'` で main の先頭コミットを見せ、意図した squash コミットに
   なっていることを確認する。
2. マージした PR の番号・タイトルと、クローズされた Issue を報告する。
3. バージョンバンプ PR(`feat: アプリのバージョンを X.Y.Z に上げる`)をマージした場合は、
   タグ付けが残っていることを伝える(`app/` で `npm run release:tag`、詳細は `/release` の
   手順 5・`adr/0025`)。

## してはいけないこと

- squash 以外の方法でマージする。main は squash merge のみ(`CLAUDE.md`)。
- チェックに引っかかった PR を、ユーザーの明示的な指示なしにマージする。
- マージが失敗したのにブランチを削除する。削除は必ずマージ成功を確認してから。
- 未コミットの変更を含む作業ツリーで `git checkout main` を実行する。
- main ブランチや、他人がまだ作業しているブランチを削除する。
