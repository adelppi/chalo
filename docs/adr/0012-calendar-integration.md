# ADR-0012: 端末カレンダー連携は expo-calendar による一方向追加とする

- ステータス: 採用 [確定]
- 関連: domain/calendar.md, adr/0008

## コンテキスト

プランを各自の端末カレンダーへ反映したい。振る舞い（一方向追加・自動更新／削除・リンク保持・例外時の挙動）は `domain/calendar.md` で定義する。本 ADR はその技術的な実現方法を定める。

## 決定

- 端末カレンダー操作は **`expo-calendar`** で行う。イベント ID 指定の取得・更新・削除が揃う **legacy API**（`expo-calendar/legacy`）を使う。
- プラン↔端末イベントの対応（`{ planId → eventId, calendarId }`）は **端末ローカルに保存**する。クラウド（Supabase）には持たない（`data-model.md`）。
  - 保存先は **AsyncStorage**（キー `calendar.links`。planId をキーにした JSON マップ）。秘匿情報ではないため SecureStore は使わない。
- リンクが失われた時の判定のため、イベントのメモ末尾に目印「チャロが追加🐾」を入れる。
- 既定の追加先カレンダー（プロファイル）は設定値として端末に保持する（AsyncStorage キー `calendar.default-calendar-id`）。
- カレンダーの利用目的文言（`NSCalendarsUsageDescription` / `NSCalendarsFullAccessUsageDescription`）は expo-calendar の config plugin（`calendarPermission`）で設定する。リマインダーは使わないため対応する文言は入れない（`remindersPermission: false`）。

## 結果

- 良い点：各自の端末で完結し、相手との同期実装が不要。
- 留意点：外部（端末カレンダーアプリ）でイベントが手動削除されるとリンクが切れる。更新／削除失敗を検知してリンクを解除し「未追加」へ戻す（振る舞いは `domain/calendar.md`）。

## 検討した代替案

- **CalDAV 等での相手とのカレンダー同期**：双方向同期は chalo の思想に反し（`domain/calendar.md`「持たないもの」は `features.md`）、実装・権限コストも高い。
