---
name: release
description: アプリのバージョンを上げる。Issue 起票→ブランチ→バンプ→PR→(マージ後)タグ付けまで進める。
argument-hint: <major|minor|patch>(省略可)
---

上げ幅: $ARGUMENTS

ストアに出すバージョン(user-facing version)を上げる一連の作業を進める。
仕組みと規約の正は `docs/adr/0025`。

GitHub の操作は GitHub MCP ツール(リポジトリ: `adelppi/chalo`)で行う。gh CLI が
インストールされていれば同等の gh コマンドでもよい。

## 手順

### 1. 上げ幅を決める

1. `git fetch origin main --tags` で最新化し、`git describe --tags --abbrev=0 origin/main`
   で直近のタグを確認する。
2. `git log --first-parent --oneline <直近タグ>..origin/main` で、前回のリリース以降に
   入った変更を読む。
3. 引数で上げ幅が指定されていればそれに従う。無ければ変更の内容から提案して確認する。
   - major: 使い方が変わる大きな作り替え
   - minor: 機能の追加・改善
   - patch: 不具合修正だけ

### 2. Issue 起票

- タイトル `[feat] アプリのバージョンを X.Y.Z に上げる`、ラベル `feature`。
- 本文に、直近タグ以降に入った変更を PR 番号付きで列挙し、この版で何を配信するかを示す。

### 3. ブランチとバンプ

1. 作業ツリーがクリーンなことを確認する。未コミットの変更があれば停止して確認する。
2. `git checkout main && git pull` で最新化し、
   `git checkout -b feat/<Issue番号>-bump-version-to-<x-y-z>` を切る。
3. `app/` で `npm run release:bump -- <major|minor|patch>` を実行する。
   - `app/package.json` と `app/package-lock.json` の version が変わる。
   - `app/app.json` は version を持たない(`app.config.ts` が package.json から注入する)
     ので触らない。
4. `git diff` で、変更が version の行だけであることを確認する。

### 4. PR 作成

1. コミットメッセージは `feat: アプリのバージョンを X.Y.Z に上げる`。本文にこの版で
   配信する変更を書く。
2. `.github/pull_request_template.md` の構成に従って PR 本文を書き、GitHub MCP の
   `create_pull_request` で作成する。タイトルはコミットメッセージと同じ形式にする
   (squash merge でそのまま main のコミットメッセージになる)。
3. 本文に `Closes #<Issue番号>` を入れる。

### 5. マージ後のタグ付け

1. ユーザーが PR をマージしたことを確認する。
2. `app/` で `npm run release:tag -- --dry-run` を実行し、対象コミットを見せて確認する。
3. `npm run release:tag` で `vX.Y.Z` の annotated タグを作成して push する。
4. タグ一覧(https://github.com/adelppi/chalo/tags)を報告する。

## してはいけないこと

- main に直接コミットする。
- PR を勝手にマージする。ユーザーの指示があった場合のみ squash merge で行う。
- マージ前にタグを打つ。タグはバンプ PR の**マージコミット**に付ける(`adr/0025`)。
- 公開済みのタグを付け替える。
- ビルド番号(`ios.buildNumber`)を触る。EAS の remote 管理・自動採番に任せる(`adr/0006`)。
