# ADR-0018: アカウント削除の実装（DB関数 + Edge Function・Apple失効・パートナー消失検知）

- ステータス: 採用 [提案→要承認]
- 関連: adr/0003, adr/0004, adr/0007, adr/0009, adr/0017, domain/pairing.md, data-model.md, non-functional.md

## コンテキスト

削除・退会の方針（何を消し、何を残すか）は `adr/0009` で確定済み。本 ADR はその**実現方式**を確定する（Issue #34）。決めるべきは、(1) 退会処理の実行主体と実行順序、(2) FK 付け替えのトランザクション化、(3) Apple トークン失効（App Store Guideline 5.1.1(v)）の具体方式、(4) パートナー消失の検知方式、の4点。

## 決定

### 実行主体は Edge Function `delete-account`（verify_jwt 有効）

- `auth.users` の削除には service role が必要なため、削除はサーバ側（Edge Function）で行う。クライアントは `supabase.functions.invoke("delete-account")` を呼ぶだけ。
- **削除対象は常に呼び出し元本人**。Edge Function は JWT（`auth.getUser()`）からユーザーを特定し、**body からは対象を受け取らない**。これにより他人のアカウントは削除できない。

### 実行順序と部分失敗

1. **Apple トークン失効**（Apple 連携ユーザーのみ。ベストエフォート、下記）
2. **`delete_account_data(p_profile_id, p_attribution)`**（DB 関数・1トランザクション）で退会者を指す FK を付け替え・削除
3. **`supabase.auth.admin.deleteUser()`** で `auth.users` を削除（`profiles` は `ON DELETE CASCADE` で連動）

2 と 3 の間で失敗しても、`delete_account_data()` は**冪等**（再実行時：owner 付け替え済みなら何もしない・削除済みの行は対象なし）なので、クライアントの再試行（トースト＋リトライ）で回復する。

### DB 関数 `delete_account_data()`（SECURITY DEFINER・plpgsql）

呼び出し元の状態で3分岐する（`data-model.md` の FK 一覧・`domain/pairing.md` に対応）：

- **相手が残っている（通常の退会）**：退会者が作ったプランのメモ末尾に作成者を追記 → `plans.owner_id` を残った側へ付け替え（NOT NULL 維持）→ `plans.locked_by / locked_at` をクリア。共有プランは消さない。
- **相手が既に削除済み（自分がロック状態の残った側）**：残っていた共有プランと `pairs` 行をまとめて削除（自分の `profiles.pair_id` を null にしてから `pairs` を消す）。
- **ソロ利用中**：付け替え先が存在しないため、本人が所有する `plans` を完全削除。

いずれの分岐でも `invites`（退会者が発行）と `push_tokens`（退会者のもの）を削除する（`profiles` の CASCADE でも消えるが、1トランザクションに明示的に含める）。

- **権限**：`anon` / `authenticated` から EXECUTE を revoke し、`service_role` のみに grant（`adr/0017` の落とし穴と同じ対処）。クライアントから直接は呼べない。
- **メモ追記の文言**（「（このプランは 〇〇（削除済み）が作成）」）は Edge Function 側の純粋関数 `buildDeletedOwnerAttribution()` が組み立てて引数で渡し、SQL は既存メモとの改行連結だけを行う（文言ロジックを Jest でテストするため。`adr/0014`）。
- `plans.owner_id` の FK は **NO ACTION のまま**とする（CASCADE を張らない）。付け替え漏れがあれば `deleteUser` が FK 違反で失敗し、共有プランが黙って消える事故を防ぐ。

### Apple トークン失効は「削除時に再認証して authorization code を取り直す」

Supabase のネイティブ Apple サインイン（`signInWithIdToken`）は identity token しか受け取らず、**Apple の refresh token をどこにも保存していない**。そこで：

1. クライアントは削除確定後、`expo-apple-authentication` の `signInAsync()` で**再認証**し、`authorizationCode` を取得して Edge Function に渡す（コードは有効期限5分・1回きり）。
2. Edge Function は client secret（`APPLE_PRIVATE_KEY` で署名した ES256 JWT）を生成し、`https://appleid.apple.com/auth/token` でコードを refresh token に交換 → `https://appleid.apple.com/auth/revoke` で失効する。

- **必要なシークレット**（Edge Function に設定）：`APPLE_TEAM_ID`・`APPLE_KEY_ID`・`APPLE_PRIVATE_KEY`（.p8 の中身）・`APPLE_CLIENT_ID`（ネイティブフローの client_id ＝ アプリの bundle id `com.adelppi.chalo`）。鍵の作成手順は `setup/auth-oidc-setup.md`。
- **ユーザーが再認証を中断**したら削除を行わない（`deleteAccount()` が false を返し、UI は静かに閉じる）。失効なしで削除だけ進む状態を作らないため。
- **失効の失敗は削除をブロックしない**（ログのみ残して続行）。「アプリ内で完結するアカウント削除」（App Store 必須要件・`non-functional.md`）を、失効（同ガイドラインの付帯要件）より優先する。シークレット未設定時も同様に警告ログのみ。

### パートナー消失の検知はペア状態取得に載せる（リアルタイム購読なし）

- `getPairState()` が「自分の `pair_id` はあるのに、同じ `pair_id` の相手の `profiles` 行が読めない」ことを検知したら `PairState` は `"partner-left"`（導出は純粋関数 `derivePairState()`）。相手の行は pair 境界 RLS（`adr/0017`）で読める前提のため、行が無い＝相手が削除済み。
- 検知タイミングは**起動時・フォアグラウンド復帰時の再取得**（`adr/0004`）に乗せる。Realtime 購読は使わない。
- ロックは `(app)/_layout` の **`Stack.Protected`** で行う。`partner-left` 中は全通常画面のガードが false になり、`partner-left` ルート（`PartnerLeftScreen`）だけが表示される。ディープリンクで他画面に入ろうとしてもロック画面へリダイレクトされる。

### 書き出しの実装

- テキスト整形は純粋関数 `buildPlansExportText()`（`features/plans/model/exportText.ts`）。含める項目は `domain/pairing.md` の目安どおり（場所の座標は v1 で入力 UI がなく常に空のため名称のみ）。
- ファイル生成と共有シートは `FileShareRepository`（interface は `features/settings/data`、実装 `expoFileShareRepository` は `global/data`。`adr/0003`）。`expo-file-system` でキャッシュ領域に `chalo-plans.txt` を書き、`expo-sharing` の共有シートに渡す。
- 設定（F-1b）とロック画面で**同一実装**（`ExportPlansDialog` ＋ `useExportPlans`）を使う。

## 結果

- 良い点：削除の本体がサーバ側に閉じ、クライアントは1リクエスト＋再試行だけ。FK 付け替えが1トランザクションで半端な状態を残さない。Apple の refresh token を平時に保存しない（漏えい面が増えない）。検知が既存の再取得方針（`adr/0004`）に乗り、新しい同期機構が不要。
- 留意点：Apple ユーザーは削除時に Apple の再認証シートが1枚挟まる（失効のためのトレードオフ）。
- 留意点：失効がベストエフォートのため、Apple 側の障害時は失効されないまま削除が完了しうる（ログで検知）。
- 留意点：`APPLE_*` シークレット未設定の間は失効がスキップされる（App Store 提出前に設定が必要）。

## 却下した案

- **クライアントから複数リクエストで削除**：付け替え・削除・auth 削除を個別に呼ぶ案。途中失敗で半端な状態が残るため不採用（`adr/0017` と同じ理由）。
- **DB 関数から `auth.users` を直接 DELETE**：Edge Function が不要になるが、Auth の管理 API を経由しない削除は Supabase が非推奨（内部整合の保証がない）。`auth.admin.deleteUser()` を使う。
- **サインイン時に Apple refresh token を保存し、削除時に失効**：削除時の再認証が不要になるが、サインインフローに token 交換が増え、refresh token という新たな秘匿情報を持つことになる。削除は稀な操作なので、再認証1枚を許容する。
- **`plans.owner_id` に ON DELETE CASCADE**：ソロ削除の明示 DELETE が不要になるが、万一付け替え前に `profiles` 行が消える経路ができたとき、ペアの共有プランが黙って消える。NO ACTION のまま関数内で明示的に処理し、漏れは FK 違反として顕在化させる。
