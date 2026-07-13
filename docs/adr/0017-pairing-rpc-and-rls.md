# ADR-0017: ペア成立 RPC と pair 境界 RLS

- ステータス: 採用 [提案→要承認]
- 関連: adr/0001, adr/0003, adr/0009, adr/0015, data-model.md, domain/pairing.md

## コンテキスト

ペア成立（招待コードの検証・`pairs` 作成・両者の `profiles.pair_id` 付与・両者のソロプランの合流）は、途中で失敗すると「片方だけペアになった」「プランの一部だけ合流した」といった半端な状態を残しうる。`domain/pairing.md` は成立処理を「サーバ側の関数で1トランザクション」と定めており、実現方式を確定する必要がある。

あわせて `#18`（plans・profiles の Supabase 化）で先送りしていた **pair 境界 RLS**（同じペアのメンバーへの開放）も、ペアが実在するようになる本 Issue で導入する必要がある。

## 決定

### ペア成立は Postgres RPC（SECURITY DEFINER・plpgsql）

- `public.redeem_invite_code(p_code text)` を1関数として定義し、次を1トランザクションで行う：
  1. 呼び出し元（`auth.uid()`）が既にペア済みでないか検証
  2. コードの存在・期限・使用済みチェック
  3. 自分のコードでないかチェック
  4. `pairs` 行を作成
  5. 招待者・呼び出し元の両方の `profiles.pair_id` を更新
  6. 両者の**ソロプラン**（`pair_id is null` のもの）へ `pair_id` を付与して共有プールへ合流
  7. `invites.used_at` を更新
- **エラーは reason ごとに区別できるメッセージを `raise exception` する**（`invite_not_found` / `invite_expired` / `invite_own_code` / `already_paired`）。クライアント（`supabasePairingRepository`）は `error.message` を `RedeemErrorReason` にマップする純粋関数 `mapRedeemErrorReason`（`features/pairing/model/invite.ts`）で変換し、`PairingCodeError` として投げ直す。
- 発行者が別経路で既にペア済み（本来は再発行で失効するはずの取りこぼし）の場合は `invite_not_found` に寄せる。コード自体を無効として扱うため。

### RLS 再帰を避けるヘルパ関数

- `public.current_pair_id()`（SQL・STABLE・SECURITY DEFINER）を用意し、呼び出し元の `profiles.pair_id` を返す。
- `profiles` を参照する RLS ポリシーがこの関数を使うことで、`profiles` 自身の RLS を再帰的に誘発しない（SECURITY DEFINER 関数は定義者の権限で実行され、テーブルオーナーは既定で RLS をバイパスするため）。
- **落とし穴**：Postgres は関数作成時に既定で `PUBLIC`（`anon` 含む）へ `EXECUTE` を付与する。加えて Supabase プロジェクトは新規関数に `anon`/`authenticated`/`service_role` へのデフォルト権限を自動付与する。`current_pair_id()` と `redeem_invite_code()` はいずれも **`anon` から明示的に `EXECUTE` を revoke** し、`authenticated` のみに許可する（advisor: `anon_security_definer_function_executable`）。

### pair 境界 RLS は既存ポリシーに「追加」する

- `plans`・`profiles` の既存ソロ境界ポリシー（`owner_id = auth.uid()` 等）はそのまま残し、ペア境界の permissive ポリシーを**新規追加**する（同一コマンドの permissive ポリシーは OR で合成される）。
  - `plans`：select/update/delete に `pair_id is not null and pair_id = current_pair_id()` を追加。プランは全共有（`domain/pairing.md`）のため、相手のプランも編集・削除できる。
  - `profiles`：select に同条件を追加し、相手の表示名を読めるようにする。
- `pairs`：メンバーのみ select 可（`id = current_pair_id()`）。書き込みは `redeem_invite_code()` の SECURITY DEFINER 経由のみで、`authenticated` に insert/update/delete を grant しない。
- `invites`：発行者本人のみ select/insert/delete。redeem は SECURITY DEFINER の RPC 経由で RLS を跨ぐ（一般 SELECT で他人の招待コードを読ませないため）。

### ペア成立後に新規作成するプランへの `pair_id` 自動付与

- `redeem_invite_code()` が合流させるのは**既存のソロプラン**のみ。ペア成立後にどちらかが新規作成するプランにも全共有の原則（`domain/pairing.md`）を適用する必要があるため、`plans` に `BEFORE INSERT` トリガー `set_plan_pair_id()` を追加し、`pair_id` が指定されていなければ作成者（`owner_id`）の `profiles.pair_id` を自動で埋める。
- これにより `supabasePlanRepository`（feature 側）は pairing を一切意識せずに済み、`app → features → global` の依存方向（`adr/0015`）を崩さない。DB 側で不変条件（ペア成立後の新規プランは必ず共有される）を保証する。

## 結果

- 良い点：成立処理が1トランザクションで完結し、途中失敗による半端な状態を防げる。RLS 再帰を避けつつ pair 境界を宣言的に表現できる。既存のソロ境界ポリシーを壊さず追加のみで拡張でき、レビューの差分が小さい。新規プランの共有漏れをトリガーで機械的に防げる。
- 留意点：Supabase advisor は `authenticated` が SECURITY DEFINER 関数を呼べること自体も警告するが、これは意図した設計（ログイン済みユーザーが呼ぶための RPC）であり是正しない。`anon` への実行権限は明示的に剥奪済み。
- 留意点：redeem 失敗時のエラー種別はメッセージ文字列で伝搬するため、RPC 側のメッセージとクライアント側のマップ（`mapRedeemErrorReason`）が乖離しないよう、変更時は両方を同時に直す。

## 検討した代替案

- **クライアント側で複数リクエストに分けて成立処理を行う**：`pairs` 作成・`profiles` 更新・`plans` 更新を個別に呼ぶ案。途中失敗時に半端な状態が残るため不採用（`domain/pairing.md` の「1トランザクション」要件を満たせない）。
- **`pair_id` 自動付与をアプリ側（Repository）で行う**：`supabasePlanRepository.create` で呼び出し元の `pair_id` を都度セットする案。動くが、将来 plans への書き込み経路が増えるたびに追随が必要で、共有漏れのリスクが残る。DB トリガーなら書き込み経路によらず保証できるため採用しない。
- **既存のソロ境界ポリシーを `ALTER POLICY` で書き換える**：条件を1つのポリシーに集約できるが、既存の検証済みポリシーを変更するより、pair 境界を独立した新規ポリシーとして追加するほうが差分が小さく安全（permissive ポリシーの OR 合成を利用)。
- **エラー種別をカスタム SQLSTATE で返す**：`RAISE EXCEPTION USING ERRCODE = ...` で `error.code` により判別する案。`supabase-js` の `PostgrestError` は `message` を直接使えるため、メッセージ文字列のマップで十分と判断し不採用。
