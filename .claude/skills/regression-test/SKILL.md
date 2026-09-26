---
name: regression-test
description: 全機能の E2E リグレッションを回す。regression タグの Maestro フローをまとめて流し、手動チェックリストをユーザーと確認して、PR に貼る結果表を作る。major・minor リリースの前、Expo SDK・RN の更新、「全体リグレッションが要る」Issue の PR で使う。
---

全体リグレッションを実行する。いつ・何を満たせば合格かの正は `docs/adr/0014-test-strategy.md`、
手動チェックリストとテスト用アカウントの用意は `.maestro/README.md`。

## 手順

### 1. 事前準備を確認する

どれか1つでも満たさなければ、流さずにユーザーへ伝えて止まる。

1. 起動中のシミュレータがちょうど1台あること(`xcrun simctl list devices booted`)。
   複数あると Maestro がどれで流すか定まらない。
2. Metro が起動していて(`lsof -i :8081`)、確認したいコード(リリースなら最新の main、
   PR ならそのブランチ)を配信していること。
3. アプリが dev client で Metro に繋がり、テスト用アカウント(ソロ)でサインイン済みで
   ホームが表示されていること。`xcrun simctl io booted screenshot <scratchpad>/pre.png` で
   撮った画面を見て確認する(Maestro MCP は使わない。理由は手順 2)。

### 2. 自動のフローを流す

1. `app/` で `npm run e2e:regression` を実行する。10分以上かかるので、Bash は
   `run_in_background` で起動し、完了の通知を待つ。
   - `regression` タグのフローだけが対象(`.maestro/config.yaml` がサブフォルダを拾う)。
   - アルバムの fixtures は、スクリプトが先に touch して今日の日付にする。
   - 流している間は Maestro MCP のツール(`run`・`inspect_screen`・`take_screenshot` など)を
     使わない。同じシミュレータのテストドライバを取り合い、全フローが
     `Failed to connect to /127.0.0.1:<port>` で落ちる。
   - それでも全フローがこのエラーで落ちたら、残ったドライバを止めてから流し直す:
     `pkill -f maestro-driver-iosUITests-Runner; pkill -f "xcodebuild test-without-building"; pkill -f "simulator-server ios"`
2. 出力の末尾にある Maestro のまとめから、フローごとの成否を読む。
3. 失敗したフローは、そのフローだけを1回流し直す
   (`maestro test .maestro/<機能>/<フロー>.yaml`)。
   - 流し直して通ったら「不安定(再実行で成功)」として扱い、結果表にそう書く。
   - 再び落ちたら失敗。落ちたステップと、そのときの画面(`take_screenshot`)から原因の
     見立てを書く。

### 3. 手動チェックリストを確認する

`.maestro/README.md` の手動チェックリストを読み、項目ごとにユーザーへ結果を聞く
(AskUserQuestion で「OK / NG / 今回は見送る」)。2〜4項目ずつまとめて聞く。
Claude が代わりに判定しない。

### 4. 結果表を出す

PR 本文(リリースならバンプ PR)に貼れる形で出す。

```markdown
## 全体リグレッション(<日付>・<シミュレータ名 / iOS バージョン>)

| フロー | 結果 |
|---|---|
| plans/plan-crud.yaml | ✅ |
| plans/plan-album.yaml | ⚠️ 不安定(再実行で成功) |
| … | |

| 手動チェック | 結果 |
|---|---|
| サインイン(Google / Apple) | ✅ |
| … | |
```

失敗や NG があれば、表の下に原因の見立てを書き、直すための Issue を起票するか
ユーザーに確認する。

## してはいけないこと

- `regression` タグの無いフローを流す。特に `settings/account-deletion-solo.yaml` は
  テスト用アカウントが消えるので、手動チェックの手順に従い使い捨てのアカウントでだけ流す。
- 失敗を直すためにコードを変える。このスキルは確認と報告まで。直すのは別の Issue で行う。
- 流していない・見送ったものを ✅ にする。
