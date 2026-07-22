# chalo ドキュメント

カップル向けの「行きたい所・やりたい事」を貯めて、いつか一緒に行くためのアプリ **chalo（チャロ）** の要求・要件・設計ドキュメント群。

`chalo` は「行こう！」の意。思いついたら手早く貯めて、二人でいつか行く。それが核となる。

## このドキュメントの使い方

- **要求・コンセプトを掴みたい** → `overview.md`
- **言葉の定義を揃えたい（人もAIも）** → `glossary.md`
- **ドメインのルールを正確に知りたい** → `domain/`
- **何を作るか（機能の一覧）** → `features.md`
- **データ構造** → `data-model.md`
- **非機能・品質・公開要件** → `non-functional.md`
- **まだ決まっていないこと（決定バックログ）** → `open-questions.md`
- **初回リリース（v1）でどこまで作るか** → `release-v1.md`
- **なぜその技術にしたか（意思決定の記録）** → `adr/`
- **外部サービスの設定手順（Google/Apple サインイン等）** → `setup/`

## 構成

```
docs/
├── README.md              … 本ファイル（目次）
├── overview.md            … ビジョン / ターゲット / 提供価値 / コアループ
├── glossary.md            … 用語集
├── features.md            … 完成版の機能一覧（持つ／持たない）
├── data-model.md          … データモデル / ER / スキーマ
├── non-functional.md      … 非機能要件・エラー方針・公開要件
├── open-questions.md      … 未確定論点・決定バックログ（[保留] の集約）
├── release-v1.md          … 初回リリース（v1）の実装範囲
├── domain/
│   ├── onboarding.md      … 導線・入力項目・権限要求方針
│   ├── plan-lifecycle.md  … プランのライフサイクルと「おしまい」
│   ├── pairing.md         … ペアリングと退会時のデータ取り扱い
│   ├── album.md           … 自動アルバムのルール
│   ├── notifications.md   … 3種類の通知の仕様
│   └── calendar.md        … 端末カレンダー連携の仕様
├── setup/                 … 外部サービスの設定・実機検証の手順書（運用）
│   └── auth-oidc-setup.md … Google/Apple サインインのコンソール設定・検証手順
└── adr/
    ├── 0001-backend-supabase.md
    ├── 0002-navigation-expo-router.md
    ├── 0003-data-layer.md
    ├── 0004-sync-strategy.md
    ├── 0005-edit-lock.md
    ├── 0006-eas-and-ota-update.md
    ├── 0007-notifications-architecture.md
    ├── 0008-offline-policy.md
    ├── 0009-account-deletion-and-handover.md
    ├── 0010-mascot-and-animation.md
    ├── 0011-logging.md
    ├── 0012-calendar-integration.md
    ├── 0013-album-local-photos.md
    ├── 0014-test-strategy.md
    ├── 0015-directory-structure.md
    ├── 0016-ui-nativewind.md
    ├── 0017-pairing-rpc-and-rls.md
    ├── 0018-account-deletion-implementation.md
    ├── 0019-legal-pages-hosting.md
    ├── 0020-bottom-sheet-gorhom.md
    └── 0021-toast-message.md
```

## 責務分離（どこに何を書くか）

同じ事実を複数の文書に書かない。各文書は次の関心ごとだけを持ち、それ以外はリンクで参照する。

**3つの層に分ける：**

| 層 | 問い | 文書 | 書くこと | 書かないこと |
|---|---|---|---|---|
| WHAT | 何を作るか | `features.md` | 機能の有無（持つ／持たない）の一覧 | 詳細ルール・ライブラリ・画面 |
| 振る舞い | どう動くか（業務ルール） | `domain/` | 状態・条件・タイミング等のルール | 技術的実現（ライブラリ／方式） |
| 実現 | どう作るか（技術判断） | `adr/` | 技術選定・実装方式とその理由 | — |

**一次情報は1か所だけ：** ある事実の「正」は1文書に置き、他文書は再掲せずリンクする。主な所在は次の通り。

| 事実 | 一次情報（正） |
|---|---|
| ステータス定義・遷移／アルバム対象日 | `domain/plan-lifecycle.md` |
| 通知の種類・条件・タイミング | `domain/notifications.md` |
| 通知の実装方式 | `adr/0007` |
| 同期方式 | `adr/0004` ／ 編集ロック方式 `adr/0005` |
| ディレクトリ構成・レイヤ／依存ルール | `adr/0015` |
| ペア成立RPC・pair境界RLSの方針 | `adr/0017` |
| アカウント削除の実装方式（DB関数・Edge Function・Apple失効・消失検知） | `adr/0018` |
| データアクセス抽象化・状態管理 | `adr/0003` |
| UIスタイリング方針（NativeWind） | `adr/0016` |
| カレンダー／アルバムの実装 | `adr/0012` ／ `adr/0013` |
| 法的ページ（規約・ポリシー）のホスティング | `adr/0019` |
| 導線・入力項目・権限要求のタイミング | `domain/onboarding.md` |
| オフライン挙動・権限拒否時の挙動・エラー網羅 | `non-functional.md` |
| 「持たないもの」 | `features.md` |
| ライブラリ一覧 | `glossary.md`（技術用語）＋ `adr/` |

`glossary.md` は言葉の**定義**のみを置き、ルール（条件・タイミング）は domain へリンクする。

## ステータスの読み方

各記述には次の印を付ける。

- **[確定]** … 議論で合意済み
- **[提案]** … こちらからの叩き台。要確認
- **[保留]** … 値・方式などの詳細が未確定（`open-questions.md` で詰める）
