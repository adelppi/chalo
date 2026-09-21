# ADR-0025: バージョンの正は package.json に置き、タグはバンプ PR のマージコミットに付ける

- 関連: adr/0006, adr/0014, CLAUDE.md, Issue #98

## コンテキスト

ストアに出すバージョン(`version` = iOS の `CFBundleShortVersionString`)は、これまで
`app.json`・`package.json`・`package-lock.json` の3か所に同じ数字を手で書いていた
(#72・#80)。同じ事実が3か所にある状態で、書き漏らしても誰も止めてくれない。

タグはさらに曖昧だった。長らく `v1.0.0` だけが存在し、`v1.1.0` / `v1.2.0` は後から
付けた。そのとき「バンプ PR のブランチ側のコミットと、main 上のマージコミットの
どちらに付けるのか」を毎回判断する必要があった。ツリーの中身は同じでも、main の
一次系列に乗るかどうかが変わる。

ビルド番号(`ios.buildNumber`)は EAS の remote 管理・自動採番に任せており(`adr/0006`)、
ここは手作業が残っていない。問題は user-facing version のほうだけ。

## 決定

### 1. バージョンの正は `app/package.json` の `version` 1か所

`app/app.config.ts` が `package.json` を読んで注入する。

```ts
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  version: pkg.version,
});
```

`app.json` は静的な設定として残し、**`version` を持たない**。Expo は静的コンフィグ
(`app.json`)を読んでから動的コンフィグ(`app.config.ts`)に渡すので、`app.json` の
他の項目はそのまま効く。解決後の設定は `npx expo config --type public` で確認できる。

### 2. 上げるのは `npm run release:bump -- <major|minor|patch>`

中身は `npm version --no-git-tag-version`。`package.json` と `package-lock.json` を
書き換えるだけで、**ブランチ上ではタグを作らない**。既存の「1 Issue = 1 ブランチ =
1 PR」に素直に乗せるため。

### 3. タグはバンプ PR の**マージコミット**に付ける

- 名前は `vX.Y.Z`、**annotated**、メッセージは `vX.Y.Z release`。
- ブランチ側のバンプコミットではなくマージコミットに付ける。両者はツリーが同じでも、
  マージコミットだけが main の一次系列(`git log --first-parent`)上にある。タグは
  「main のこの時点を配信した」という印なので、main 上の点を指すべき。既存の
  `v1.0.0` もマージコミットに付いており、揃う。

### 4. タグ付けは `npm run release:tag`

`app/scripts/release-tag.js`。やることは次の通り。

1. `origin/main` を fetch する。
2. 同名タグがローカル・リモートに無いことを確かめる(**公開済みのタグは付け替えない**)。
3. 対象コミットを決める = **main の一次系列上で `app/package.json` の version が
   今の値に切り替わったコミット**(version が目的の値で、第一親はまだ別の値)。
4. 候補がちょうど1件でなければ止める。
5. annotated タグを作って push する。

対象コミットの判定は I/O を持たない純粋関数(`app/scripts/version-bump-commit.js`)に
切り出し、Jest でテストする(`adr/0014`)。`-- --dry-run` を付けると対象を表示して終わる。

### 5. ビルド番号は触らない

`eas.json` の `appVersionSource: "remote"` と production の `autoIncrement: true` の
まま(`adr/0006`)。EAS の `autoIncrement` はそもそも `version` を対象にしない。
user-facing version は「次はこれを配信する」という人の判断なので、人が決める。

### 6. CHANGELOG は持たない

変更履歴は Issue・PR と、タグ間の compare で追える。ソロ開発でストア配信のみのため、
別ファイルとして二重に持つ理由がない。

## 結果

- 良い点
  - バージョンを書く場所が1か所になり、`npm run release:bump` だけで版上げが終わる。
  - 「どのコミットにタグを付けるか」の判断がスクリプトに固定され、毎回迷わない。
  - 判定ロジックが純粋関数なので、履歴の形(差し戻し・再バンプ)に対する振る舞いを
    テストで確かめられる。
- 留意点
  - **`v1.0.0` だけはこの規約で選ばれるコミットと違う。** `v1.0.0` は配信時点の
    コミット(`bff8ccf`)に付いているが、本方式が選ぶ「version が 1.0.0 になった
    コミット」は初期スキャフォールド(`cb64af5`)。1.0.0 は最初から 1.0.0 だったため。
    過去のタグは付け替えない。
  - 動的コンフィグ(`app.config.ts`)になるため、EAS CLI が app config へ値を書き戻す
    操作はできない。今はビルド番号を remote に任せているので影響しない。
  - 版を差し戻して上げ直すと切り替わり点が複数になり、スクリプトは止まる。その場合は
    表示された候補から選んで手で `git tag -a` する。
  - 切り替わり点の探索は `app/package.json` に触れた直近50コミットまで。現在の版を
    タグ付けする用途では足りる。

## 検討した代替案

- **`app.json` を正にして `package.json` へ同期するスクリプトを書く**: 書く場所が
  1か所になる点は同じだが、同期の向きを保つコードを持ち続けることになる。
  `app.config.ts` なら Expo の仕組みだけで済む。
- **release-please / semantic-release(CI で自動リリース)**: コミットから
  リリース PR やタグを自動生成できる。ただし CI が前提で、いまリポジトリに
  GitHub Actions は無い。また「いつストアに出すか」は人の判断であり、main への
  マージを配信の合図にはしたくない。CI を入れるときの移行先の候補としては有力。
- **`commit-and-tag-version`(旧 standard-version)**: CHANGELOG 生成が主目的で、
  6 の通り CHANGELOG を持たない以上、得るものが `npm version` と変わらない。
- **タグをブランチ側のバンプコミットに付ける**: 配信したツリーそのものを指せるが、
  main の一次系列から外れ、`git log --first-parent` や compare の見え方が崩れる。
- **タグを手動運用のまま規約だけ文書化する**: 今回の「どちらに付けるか」の迷いが
  そのまま再発する。判断はコードに固定するほうが確実。
