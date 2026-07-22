# ADR-0015: ディレクトリ構成・アーキテクチャ（feature-based）

- ステータス: 採用 [確定]
- 関連: adr/0002, adr/0003, features.md, glossary.md
- 参考: React feature-based folder structure（https://ahmad2point0.medium.com/react-app-feature-based-folder-structure-guide-848ddc7447d5）

## コンテキスト

RN + Expo（Expo Router）で、プラン・アルバム・ペア・通知・カレンダー等の機能を持つ。AI駆動開発では「どこに何を置くか」が規約化されているほど指示が通る。ファイル種別（`components/` `hooks/` …）で切ると、機能を1つ足すたびに全ディレクトリを横断し、関連コードが散る。機能（feature）単位で自己完結させ、共有基盤とはっきり分ける。

## 決定

**feature-based 構成**を採用する。`src/` 直下を役割で分け、業務ロジックは feature 単位に閉じる。

### レイヤ（`src/` 直下）

- **app/** … Expo Router の画面のみ（ルーティング。`adr/0002`）。画面は feature の公開APIを組み立てるだけで、業務ロジックを持たない。
- **features/** … 機能単位の業務ロジック。各 feature が自分の `components` / `hooks` / `data` / `model` / `utils` を持ち、`index.ts`（バレル）だけを外へ公開する。
- **global/** … 全機能で共有する基盤。共通UI・共通フック・設定・サードパーティのラッパー（Supabase 等）・状態ストア・データアクセスの実装を置く。
- **assets/** … フォント・画像・アイコン・Rive 等の静的資産。

### feature の内部構成（例：`features/plans/`）

- **components/** … その機能の画面部品。
- **hooks/** … TanStack Query のフック（`usePlans` / `useCreatePlan` 等）。Repository を呼び、取得・キャッシュ・楽観更新を担う（`adr/0003`）。
- **data/** … その機能の **Repository interface** と `queryKey` 規約、行⇄ドメイン型の契約。実装は持たない（`adr/0003`）。参考記事の `services/` に相当するが、Supabase 非依存にするため interface に振る。
- **model/** … ドメイン型と純粋ロジック（例：ステータス導出）。ライブラリに依存しない。
- **utils/** … 補助関数。
- **index.ts** … 公開API。外部はここ経由でのみ参照する。

### global の内部構成

- **components/**（`ui/` 基本部品・`shared/` 複合部品）、**hooks/**、**utils/**、**constants/**、**config/**、**@types/**、**store/**（Zustand。`adr/0003`）。
- **lib/** … サードパーティのラッパー。`supabase/` は supabase-js を import する唯一の場所（生クライアント生成）。
- **data/** … 各 feature の Repository interface に対する **Supabase 実装を集約**する（差し替え対象を一望できる。`adr/0003`）。ここは基盤（アダプタ）層で、feature の契約（interface・型）に依存してよい。

### 依存の方向（アーキテクチャ）

- `app → features → global`。逆流させない。**lint で強制する**：`src/global/`（`global/data/` を除く）から `@features/*` を import すると ESLint エラーになる（`no-restricted-imports`）。逆流は require cycle を生むため、共有したい部品は該当 feature に置き、そのバレルから公開する。
- **feature 間は直接 import しない**。参照は相手の `index.ts`（バレル）経由に限る。連携は global の共有サービス／状態を通す。
- **業務ロジック・フックは抽象（Repository interface）だけに依存**する。Supabase 実装（`global/data`・`global/lib/supabase`）へは直接依存しない。
- interface と実装の結線は**合成ルート**（アプリ起動時のプロバイダ）で行う。`global/data` が feature の interface を実装する向きで、依存はドメイン契約へ内向きに集まる。feature 側は実装の存在を知らない。基盤の差し替えは `global/lib/supabase`・`global/data` の付け替えだけで済み、feature は不変（`adr/0003`）。

### 規約

- **バレル公開**：各 feature／フォルダは `index.ts` で公開範囲を明示し、内部フォルダへの直接 import を禁止する（lint で守る）。
- **パスエイリアス**：`@/*`・`@features/*`・`@global/*`（`tsconfig` の `baseUrl: src`）。相対 import の連鎖を避ける。

### ディレクトリツリー（例）

```
src/
├── app/                         # Expo Router：画面のみ（adr/0002）
│   ├── (tabs)/
│   │   ├── index.tsx            # やりたい一覧（ホーム）
│   │   ├── album.tsx
│   │   └── _layout.tsx
│   ├── plan/[id].tsx            # プラン詳細（通知ディープリンク先）
│   ├── settings/
│   └── _layout.tsx
│
├── features/
│   ├── plans/
│   │   ├── components/
│   │   ├── hooks/               # usePlans, useCreatePlan …（TanStack Query）
│   │   ├── data/                # PlanRepository interface, queryKeys, 型契約
│   │   ├── model/               # ドメイン型・ステータス導出
│   │   ├── utils/
│   │   └── index.ts             # 公開API（バレル）
│   ├── album/
│   ├── pairing/
│   ├── auth/
│   ├── onboarding/
│   ├── notifications/
│   ├── calendar/
│   ├── place/
│   └── settings/
│
├── global/
│   ├── components/
│   │   ├── ui/                  # Button, Card …
│   │   └── shared/              # OfflineBlocker, チャロくん …
│   ├── hooks/
│   ├── utils/
│   ├── constants/
│   ├── config/
│   ├── @types/
│   ├── store/                   # Zustand（クライアント状態）
│   ├── lib/
│   │   └── supabase/            # supabase-js を import する唯一の場所
│   ├── data/                    # Repository の Supabase 実装を集約（差し替え対象）
│   └── index.ts
│
└── assets/                      # fonts / images / icons / rive
```

### feature の割り付け（`features.md` / `domain/` と対応）[提案]

- `plans`（コア：作成・編集・一覧・検索・ステータス。`domain/plan-lifecycle.md`）
- `album`（`domain/album.md`）
- `pairing`（ペア成立・招待・退会付け替え・ロック状態・書き出し。`domain/pairing.md`）
- `auth`（Google / Apple サインイン。`domain/onboarding.md`）
- `onboarding`（導線・権限要求。`domain/onboarding.md`）
- `notifications`（作成・期限・振り返り。`domain/notifications.md`・`adr/0007`）
- `calendar`（端末カレンダー連携。`domain/calendar.md`・`adr/0012`）
- `place`（地図・場所・Appleマップ受け渡し）
- `settings`（設定・不具合報告／ログ送信。`adr/0011`）

粒度は実装時に調整する。

## 結果

- 良い点：機能ごとに関連コードがまとまり、追加・削除・レビューが局所化する。AIに「この feature に足して」と指示しやすい。共有基盤との境界が明快。抽象化（`adr/0003`）と組み合わさり、Supabase 依存が global に閉じる。
- 留意点：feature 境界の判断が要る（重複機能はどちらに置くか）。`global/data` が各 feature の契約を知るため、feature を消すときは対応する実装も消す。バレルの貼り忘れは内部 import を招くので lint で守る。

## 検討した代替案

- **ファイル種別ベース**（`components/` `screens/` `hooks/` で全機能を横断）：小規模では楽だが、機能追加で全ディレクトリを触り関連が散る。採用しない。
- **Atomic Design を全面採用**：UI 粒度の分類には有効だが、業務ロジックの置き場を決めない。`global/components` 内の整理に部分的に使う程度に留める。
- **単一 `src` フラット**：規約が無く、人にもAIにも置き場が揺れる。採用しない。
