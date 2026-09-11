# 用語集（Glossary）— chalo

人とAIが同じ言葉で話すための辞書。実装・UI文言・ドキュメントはこの語彙に揃える。英語表記はコード上の識別子の目安。

**ここに置くのは言葉の定義だけ**。条件・タイミング・値といったルールは「正」の列が指す文書を読む（ここには再掲しない）。

## コア概念

| 用語 | 英語 | 定義 | 正 |
|---|---|---|---|
| プラン | Plan | chalo の中心となるデータ。「行きたい所・やりたい事」一つ分。1プラン＝1TODOアイテム。タイトルだけで成立し、後から編集できる。持つ項目はタイトル（必須）/ 日付 / 時刻 / 期限 / 場所 / 参考URL / メモ / ステータス / 作成者 | `data-model.md` |
| いつかやることリスト | someday list | 日付未定のものを含む、貯めたプラン全体の心象。chalo の核となる体験。UI上は「やりたい」と表現する | `overview.md` |
| ステータス | Status | プランのライフサイクル上の状態。`やりたい` / `予定` / `おしまい` の3つ | `domain/plan-lifecycle.md` |
| やりたい | Wish | 日付が入っていないプラン | `domain/plan-lifecycle.md` |
| 予定 | Scheduled | 日付が入ったプラン | `domain/plan-lifecycle.md` |
| おしまい | Done / Closed | 体験が完了した状態。自動（予定日の終わり）と手動（ボタン）の2経路がある | `domain/plan-lifecycle.md` |
| おしまい日 | Closed date | プランが「おしまい」になった日 | `domain/plan-lifecycle.md` |
| 期限 | Deadline | 「これを過ぎると行けなくなる」日。**行く予定日（日付）とは別物**で、通知のためだけの情報 | `domain/plan-lifecycle.md` |
| アルバム対象日 | Memory anchor date | アルバムが写真を拾う対象の日 | `domain/plan-lifecycle.md` |
| アルバム | Album | おしまいになったプランに紐づく、その日に撮られた写真の自動コレクション。端末ローカル完結 | `domain/album.md`（未実装） |

> 「おしまい」は chalo らしい温かい呼び名として正式採用した語（"完了" "達成" ではない）。UI 文言もこれに揃える。

## ペア

| 用語 | 英語 | 定義 | 正 |
|---|---|---|---|
| ペア | Pair | 1対1で結ばれた二人の関係。chalo は常に二人一組での利用を想定する | `domain/pairing.md` |
| パートナー | Partner | ペアの相手 | — |
| 相手の呼び方 | Partner nickname | ユーザーが設定でパートナーをどう呼ぶか。各自の見え方で、相手の画面は変わらない | `domain/pairing.md` |
| 招待コード | Invite code | ペアを成立させるためのコード。一方が発行し、もう一方が入力する（手入力方式） | `domain/pairing.md` |
| ソロ利用 | Solo | ペアを招待するまでの一人の状態。chalo は一人での継続利用は想定しない | `domain/pairing.md` |
| ロック状態 | Locked | パートナーが退会したあと、残った側が入る状態。書き出しとアカウント削除しかできない | `domain/pairing.md` |
| 書き出し | Export | 全プランを連結した1つのテキスト（.txt）を生成し、iOS共有シートで共有する常設バックアップ | `domain/pairing.md` |

## 同期・編集

| 用語 | 英語 | 定義 | 正 |
|---|---|---|---|
| 同期 | Sync | ペア間でプランのデータを揃えること | `adr/0004` |
| 編集ロック | Edit lock | 相手が編集中のプランを同時に編集しないための仕組み。TTL で自動失効する | `adr/0005` |
| 競合検知 | Conflict detection | 編集ロックによって、二人が同じプランを同時に編集する状況を防ぐこと | `adr/0005` |

## 機能・UI

| 用語 | 英語 | 定義 | 正 |
|---|---|---|---|
| 参考URL | Reference URL | プランに1つだけ持てる、タップで遷移できるURL文字列。ドメインに応じたアイコンの出し分けは未実装 | `features.md` 8 |
| カレンダー連携 | Calendar | プランを各自の端末カレンダーへ一方向で追加する機能。相手とは同期しない | `domain/calendar.md` |
| 触覚フィードバック | Haptics | 意味の大きい操作に与える振動フィードバック。全操作には付けない | `features.md` 10.3（未実装） |
| 空状態 | Empty state | プランが0件のときなどの表示。チャロくんのグレーの足跡を画面中央に置く | `features.md` 2.5 |

## マスコット・ブランド

| 用語 | 英語 | 定義 | 正 |
|---|---|---|---|
| チャロくん | Chalo | chalo のマスコット。犬とたぬきのニュアンスを併せ持つ。素材は顔・しっぽ・足跡。静的アセットで表示する | `adr/0010` |
| 足跡 | Pawprint | チャロくんのモチーフ。「行った跡／旅の証」を表すブランド要素 | `adr/0010` |

## 通知

| 用語 | 英語 | 定義 | 正 |
|---|---|---|---|
| 作成通知 | Creation push | パートナーがプランを作成したときに飛ぶプッシュ通知 | `domain/notifications.md` |
| 期限通知 | Deadline push | 期限のあるプランを、終わる前に知らせる通知 | `domain/notifications.md` |
| 振り返り通知 | Reminiscence push | 1年前におしまいになったプランについて、また行ける頃に知らせる通知 | `domain/notifications.md`（未実装） |

## 技術用語

ライブラリの実物・バージョンは `app/package.json` を正とする。ここに載せるのは docs 中で説明なしに出てくる語だけ。

| 用語 | 意味 | 正 |
|---|---|---|
| Supabase | 認証・DB（Postgres）・同期を担うBaaS | `adr/0001` |
| OIDC | Supabase 経由の Google / Apple ソーシャル認証 | `adr/0001`、`setup/auth-oidc-setup.md` |
| feature-based 構成 | 機能（feature）単位でコードをまとめるディレクトリ方針 | `adr/0015` |
| Repository | データの読み書きをドメイン単位の interface で抽象化した層。ロジックはこれに依存し、Supabase 実装には依存しない | `adr/0003` |
| TanStack Query | サーバ状態の取得・キャッシュ・再取得・楽観更新を担うライブラリ | `adr/0003` |
| Zustand | クライアント状態（UI・トグル等）の軽量ストア | `adr/0003` |
| NativeWind | Tailwind のユーティリティクラスを `className` で当てる RN 向けスタイリング | `adr/0016` |
| EAS / eas update | Expo のビルド・配信基盤と、JSバンドルの OTA 配信 | `adr/0006` |
| Expo push token | 端末ごとのプッシュ送信先トークン | `adr/0007` |
| pg_cron | Postgres上の定期実行。振り返り通知の日次バッチに使う（未実装） | `adr/0007` |
| TTL | Time To Live。編集ロックの自動失効時間 | `adr/0005` |
