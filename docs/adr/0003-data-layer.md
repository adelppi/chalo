# ADR-0003: データアクセス抽象化・状態管理

- ステータス: 採用 [確定]
- 関連: adr/0001, adr/0004, adr/0005, adr/0008, adr/0014, adr/0015, data-model.md

## コンテキスト

サーバ状態（プラン・プロフィール等）が中心で、起動/復帰時の同期・楽観更新（作成の即時反映）が要る。基盤は Supabase（`adr/0001`）だが、将来 Supabase を別基盤へ差し替えても**業務ロジックを書き換えずに済む**ようにしたい。取得・キャッシュ・再取得・楽観更新は定石に載せ、AIに書かせやすくする。

## 決定

### データアクセスの抽象化（Repository）

- **ドメイン単位の Repository interface** を定義する（例：`PlanRepository`・`ProfileRepository`・`InviteRepository`・`PushTokenRepository`・`BugReportRepository`）。interface は `features/<機能>/data` に置く（`adr/0015`）。
- 業務ロジック・フックは **interface だけに依存**する。Supabase の API を直接呼ばない。
- Repository は**ドメイン型を返す**（DB 行そのままでなく `data-model.md` の型へマッピング）。行⇄ドメイン型の変換は実装内に閉じる。
- **Supabase 実装は `global/data` に集約**し、`global/lib/supabase` の生クライアントだけが supabase-js を import する（`adr/0015`）。基盤を差し替えるときはここだけ差し替える。interface と実装の結線は合成ルート（起動時のプロバイダ）で行う。

### 状態管理

- **サーバ状態**：**TanStack Query**（取得・キャッシュ・再取得・楽観更新を担当）。`useQuery` / `useMutation` フックは feature 層に置き、**Repository を呼ぶ**。
- **Repository は純粋な Promise** を返し、TanStack Query を知らない（ライブラリ非依存を保つ）。
- **queryKey 規約**：feature ごとに集約する（例 `['plans']`・`['plans', id]`）。無効化・再取得の基準を一貫させる。
- **クライアント状態**（UI・トグル等の軽い状態）：必要な範囲で軽量ストア（Zustand）。過剰に広げない。

### 更新のふるまい

- **作成の体感**：楽観更新で即リストに反映。失敗時はロールバック＋トースト。
- **更新衝突**：基本 last-write-wins。同時編集は編集ロックで防ぐ（`adr/0005`）。

## 結果

- 良い点：業務ロジックが Supabase API に依存せず、基盤の差し替えが `global/data`・`global/lib/supabase` の付け替えで済む。Repository をモックすればロジック・フックを単体テストしやすい（`adr/0014`）。取得/キャッシュ/楽観更新が定石化しAIに書かせやすい。起動時同期（`adr/0004`）と素直に噛み合う。
- 留意点：interface と実装の二重定義の手間。薄いCRUDには冗長になりうるが、境界維持のため許容する。オフライン時はブロックする（`adr/0008`）ため、キャッシュはセッション内の再取得・楽観更新に用いる。

## 検討した代替案

- **feature から Supabase を直接呼ぶ**：手軽だが基盤に密結合し、差し替え・テストが困難。採用しない。
- **汎用 DataSource 1本で全テーブルを扱う**：実装は減るが型が緩く、ドメインの意図が出ない。ドメイン単位の interface を採る。
- **Repository がフック／queryKey ごと提供**：呼び出しは楽だが Repository が TanStack Query に依存し、差し替え時の影響が広がる。Repository は純 Promise に留める。
- **Redux Toolkit (+RTK Query)**：選択肢だが、サーバ状態中心の本アプリには TanStack Query が軽量。
- **手書きの fetch ＋自前キャッシュ**：再取得・楽観更新の作り込みコストが高い。
