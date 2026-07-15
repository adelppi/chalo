# ADR-0007: 通知アーキテクチャ（2系統）

- ステータス: 採用 [確定]
- 関連: domain/notifications.md, adr/0001

## コンテキスト

通知は3種類（作成・期限・振り返り）。それぞれ性質が異なる（即時 / 固定オフセット / 1年以上先）。`domain/notifications.md` 参照。

## 決定

通知を **2系統** で実装する。

### 系統1：端末ローカル予約通知（expo-notifications）
- 対象：**期限通知**（期限の2週間前に1回）。
- 理由：固定オフセットでオフラインでも鳴る。
- プラン編集で期限/日付が変わったら、**予約を組み直す**（旧予約削除→再予約）。送らない条件（日付済み・2週間未満）も予約時に判定。

### 系統2：サーバ push（Expo Push ＋ Supabase）
- 対象：**作成通知**（相手の作成を即時に）、**振り返り通知**（1年前のおしまいを2週間前に）。
- 仕組み：
  - 各端末の **Expo push token を Supabase に保存**（`push_tokens`）。
  - **作成通知**：プラン作成（INSERT）をトリガに Edge Function 等でパートナーへ送信。
  - **振り返り通知**：**pg_cron の日次バッチ**で「通知日 =（おしまい日+1年)−2週間」に該当するプランを抽出し、二人へ送信。
  - **タイムゾーン**：`profiles.timezone` を使って配信時刻を算出。
- 送信失敗はユーザーに見せず、サーバでログ／リトライ。

### 共通
- どの通知も**タップで該当プラン詳細へディープリンク**（`adr/0002`）。
- 通知先プランが削除済みなら「見つかりません」。
- 通知許可はペア成立直後に要求（JIT＋プライミング、`domain/onboarding.md`）。拒否時は設定→iOS設定へ。

### 作成通知の具体的な実装 [確定]（#31）

- **トークン登録**：端末は通知権限が許可されていれば `getExpoPushTokenAsync` で Expo push token を取得し、`push_tokens`（`profile_id` ＋ `expo_push_token` に unique 制約）へ upsert する。`addPushTokenListener` はネイティブトークン変更の合図に過ぎず、受け取るのは APNs の生トークンで Expo push token とは別物のため、通知が来たら `getExpoPushTokenAsync` を呼び直して保存する。
- **トリガー方式**：`plans` への `AFTER INSERT` トリガー（`public.notify_plan_created()`、`SECURITY DEFINER`）が `pg_net`（`net.http_post`）で Edge Function `notify-plan-created` を非同期に呼ぶ。`pair_id is null`（ソロ）なら何もしない。`pg_net` は fire-and-forget のため INSERT トランザクションをブロックせず、呼び出し自体が失敗しても例外を握りつぶしてプラン作成は成功させる。
- **認証**：Edge Function は `verify_jwt: true`（既定）のまま。トリガーは `Authorization: Bearer <anon key>` を付けて呼ぶ（anon key は JWT 検証を通すためだけに使う値で、アプリ本体にも同梱済みの非秘匿値）。Edge Function 内部では自動注入される `SUPABASE_SERVICE_ROLE_KEY` で管理者クライアントを作り、`profiles`／`push_tokens` を RLS を介さず参照する。
- **秘匿値の保管**：呼び出し先 URL（`edge_function_url`）と anon key（`edge_function_anon_key`）は **Supabase Vault**（`vault.decrypted_secrets`）に保存し、migration には値を含めない（`vault.create_secret(...)` は運用で別途実行）。Expo Push API 用の `EXPO_ACCESS_TOKEN` は任意（未設定でも送信可）で、設定する場合は Edge Function のシークレットとして登録する。
- **送信・リトライ**：Edge Function は Expo Push API（`https://exp.host/--/api/v2/push/send`）へ最大3回・簡易バックオフでリトライする。失敗はサーバ側ログ（`console.error`）に残すのみでユーザーには見せない。振り返り通知のような pg_cron 定期バッチは使わない（v1 スコープ外。`release-v1.md`）。
- **ペイロード**：`data: { url: "/plan/<id>" }` の形に統一し、`#30` のタップ遷移（`extractNotificationUrl`・`useNotificationObserver`）をそのまま流用する。

## 結果

- 良い点：各通知の性質に最適な方式を選べる／1年先予約のローカル不安定さ（iOS上限・再インストール）を回避。
- 留意点：2系統あるため、プラン編集時に「ローカル予約の組み直し」と「サーバ状態の更新」の両方を忘れない。テスト観点に含める。

## 確定させたい論点 [保留]

- 振り返りで同日に複数該当した場合（プランごと送付 or まとめて1通）。`open-questions.md` Q-NOTIF-2。
