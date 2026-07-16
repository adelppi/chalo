# ADR-0019: 法的ページ（プライバシーポリシー・利用規約）のホスティング

- ステータス: 採用 [確定]
- 関連: non-functional.md（App Store 公開要件）, features.md 9.9, adr/0009（退会時のデータ取り扱い。利用規約の記載内容に反映）

## コンテキスト

App Store 公開にはプライバシーポリシー・利用規約の公開 URL が必須（`non-functional.md`）。アプリ内（サインイン画面 A-2・設定 E-1）からも開けるようにする。ソロ開発・無料提供のため、追加コスト・運用負荷なしでホストしたい。文面はデータの取り扱い（`data-model.md`・`adr/0009`）と実装が変わるたびに更新するので、コードと同じリポジトリ・同じ PR フローで管理できると望ましい。

## 決定

**GitHub Pages（source: `main` ブランチ / `/docs` フォルダ）で `docs/legal/` 配下の静的 HTML を公開する。**

- 配置: `docs/legal/privacy.html`・`docs/legal/terms.html`。素の HTML + インライン CSS の単一ファイルで、ビルド工程を持たない。
- 公開 URL: `https://adelppi.github.io/chalo/legal/privacy.html`・`https://adelppi.github.io/chalo/legal/terms.html`。
- `docs/.nojekyll` を置き、GitHub Pages の既定の Jekyll ビルドを無効化する。`docs/` 配下の既存 Markdown（ADR・domain 等）を Jekyll が処理して不要なページを生成したり、ビルドエラーになったりするのを防ぐ（既存 Markdown も生の URL では見えるが、リンクを張らないため実質非公開扱い）。
- アプリからは `Linking.openURL` で外部ブラウザ（Safari）で開く。URL 定数は `global/constants/legalLinks.ts` に置き、サインイン画面と設定画面の両 feature から参照する（依存方向は `adr/0015` に従い global に配置）。
- GitHub Pages の有効化（Settings > Pages。source: Deploy from a branch / `main` / `/docs`）はリポジトリ設定の手動操作。一度有効化すれば、以後は main へのマージだけで自動反映される。

## 結果

- 良い点: 追加コスト・追加インフラなし。文面がコードと同じリポジトリ・PR フローで版管理され、データ取り扱いの変更と同じ PR で文面を更新できる。マージだけで公開が更新される。
- 留意点:
  - リポジトリが public であることが前提（private の GitHub Pages は有料プラン）。
  - `docs/` 全体が Pages の公開対象になる。内部ドキュメント（ADR 等）も URL を知っていれば見える。本リポジトリはもともと public なので新たな露出ではない。
  - URL が `github.io` ドメインになる。独自ドメインが必要になったら CNAME 設定で移行できる（URL 変更時はアプリ側の定数更新と App Store Connect の再申請が要る）。

## 検討した代替案

- **アプリ内に文面を埋め込む（WebView・静的画面）**: App Store Connect のプライバシーポリシー URL 欄には公開 Web ページが必要なため、埋め込みだけでは要件を満たせない。文面更新にアプリの再リリースも要る。不採用。
- **Notion・Google Sites 等の外部サービス**: リポジトリ外に一次情報が分散し、版管理・PR レビューの対象外になる。不採用。
- **Vercel / Netlify / Cloudflare Pages**: 静的 HTML 2枚に対して別サービスのアカウント・デプロイ設定を増やす価値がない。ビルド工程が要る規模になったら再検討。不採用。
- **`docs/legal/` を Jekyll でビルドさせる（`.nojekyll` なし）**: Markdown で書けるが、`docs/` 配下の既存 Markdown 群が意図せず処理される。素の HTML 配信のほうが挙動が予測しやすい。不採用。
