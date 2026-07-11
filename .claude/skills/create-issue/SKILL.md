---
name: create-issue
description: 一文程度の大まかな要求から、質問で詳細を掘り下げて GitHub Issue を起票する。種別は feature(機能実装)/ bug(バグ報告)/ design(設計議論)。
argument-hint: <やりたいことの一文>
---

ユーザーの要求: $ARGUMENTS

ユーザーは大まかな一文しか渡さない想定。**足りない情報はこちらから質問して埋める**のがこのスキルの役割。いきなりドラフトを書かない。

GitHub の操作は GitHub MCP ツール(リポジトリ: `adelppi/chalo`)で行う。gh CLI がインストールされていれば同等の gh コマンドでもよい。

## 手順

1. **種別の判定**: feature / bug / design のどれかを判断する。曖昧なら最初の質問で確認する。
2. **重複チェック**: GitHub MCP の `search_issues`(クエリ例: `repo:adelppi/chalo <キーワード>`)で類似 Issue を探す。既存があれば起票せず、その Issue を提示して指示を仰ぐ。
3. **関連ドキュメントの下調べ**: 要求に関係する `docs/domain/`・`docs/adr/`・`docs/features.md` を読む。質問の質を上げるためにも、ドラフトを書くためにも必要。docs と矛盾する要求なら、質問より先にその場で指摘する。
4. **質問で詳細を掘る**: AskUserQuestion(選択肢で聞ける場合)や通常の質問で、テンプレートの必須欄が埋まるまで聞く。一度に全部ではなく 2〜3 個ずつ。
   - feature: スコープの境界(どこまでやるか・やらないか)、受け入れ条件、docs に書かれていない仕様の確認
   - bug: 再現手順、期待する挙動と実際の挙動、発生環境
   - design: 決めたい論点の正確な範囲、すでに頭にある選択肢、決定を急ぐ背景
   - ユーザーがすでに答えたことや docs から分かることは聞き直さない。
5. **ドラフト提示**: `.github/ISSUE_TEMPLATE/` の該当テンプレートのセクション構成に従って本文を書き、タイトルと合わせてユーザーに見せて承認を得る。
6. **起票**: GitHub MCP の `issue_write` で作成し、URL を報告する。
   - タイトルとラベル: feature → `[feat] …` + `feature` / bug → `[bug] …` + `bug` / design → `[design] …` + `design`。

タイトル・本文はすべて日本語で書く。
