# セットアップ手順: Google / Apple サインイン（OIDC）

Issue #8 で実装した認証を実際に動かすための、**コンソール設定と実機検証の手順書**。
コード側（`auth` feature・`profiles` マイグレーション・app 設定）は実装済み。ここに書くのは AI から実行できない外部設定と、実機での確認。

- 認証方式の決定: `adr/0001-backend-supabase.md`（Supabase Auth の OIDC）
- サインインの位置づけ: `domain/onboarding.md`（A2）
- Supabase プロジェクト ref: `yqroflyjbokeegpryjdr`
- Supabase コールバック URL: `https://yqroflyjbokeegpryjdr.supabase.co/auth/v1/callback`
- iOS Bundle ID: `com.adelppi.chalo`
- URL スキーム: `chalo`

> 用語: 「Dashboard」= Supabase Dashboard（<https://supabase.com/dashboard>）。

---

## 1. Google（OAuth ブラウザフロー）

このアプリは iOS 専用クライアントを作らず、`expo-web-browser` + `supabase.auth.signInWithOAuth()` のブラウザフローを使う。Google のクライアント ID/シークレットは **Supabase 側にだけ**置く（アプリには埋め込まない）。

1. **Google Cloud Console** → 「APIとサービス」→「認証情報」。
2. OAuth 同意画面を未設定なら構成する（External / テストユーザーに自分を追加）。
3. 「認証情報を作成」→「OAuth クライアント ID」→ アプリの種類 **ウェブ アプリケーション**。
   - 名前: 任意（例 `chalo-supabase`）。
   - **承認済みのリダイレクト URI** に次を追加:
     `https://yqroflyjbokeegpryjdr.supabase.co/auth/v1/callback`
4. 発行された **クライアント ID / クライアントシークレット** を控える。
5. **Dashboard → Authentication → Providers → Google** を有効化し、上記のクライアント ID とシークレットを貼る。保存。

> iOS 専用クライアント ID は作らない（ガイド準拠のブラウザフローのため）。アプリ側に Google クライアント ID の環境変数は不要。

## 2. Apple（Sign in with Apple / ネイティブ）

アプリは `expo-apple-authentication` のネイティブフロー（`signInWithIdToken`）を使う。**実機必須**（シミュレータ不可）。

### Apple Developer 側

1. **Certificates, Identifiers & Profiles → Identifiers**。
2. App ID `com.adelppi.chalo` に **Sign In with Apple** ケイパビリティを有効化。
3. **Services ID** を作成（例 `com.adelppi.chalo.signin`）。Sign In with Apple を有効化し、
   - Web Domain: `yqroflyjbokeegpryjdr.supabase.co`
   - Return URL: `https://yqroflyjbokeegpryjdr.supabase.co/auth/v1/callback`
4. **Key** を作成し、Sign In with Apple を有効化。**Key ID** と `.p8` 秘密鍵をダウンロード。**Team ID** も控える。

### Supabase 側

**Dashboard → Authentication → Providers → Apple** を有効化し、次を設定:

- **Client IDs**: `com.adelppi.chalo`（アプリの Bundle ID）を含める。
  ネイティブの `signInWithIdToken` では、Supabase が ID トークンの audience（= Bundle ID）を検証するため、**Bundle ID を必ず登録する**。Services ID を併記してもよい。
- Secret Key 系（Services ID / Team ID / Key ID / `.p8`）を入力。保存。

## 3. リダイレクト URL（カスタムスキーム）

**Dashboard → Authentication → URL Configuration → Redirect URLs** に、アプリのスキームを追加:

- `chalo://`

> アプリは `makeRedirectUri()`（`expo-auth-session`）で生成した URL を `redirectTo` に使う。
> 正確な値を確認したいときは、dev client 起動中に `supabaseAuthRepository` の `redirectTo` をログ出力して、その値を許可リストに追加する。

## 4. ネイティブビルド（dev client）

`expo-apple-authentication` は Expo Go では動かない。config plugin を反映した **dev client** をビルドする。app 設定（`app.json`）は実装済み（`usesAppleSignIn: true`、config plugins 追加済み）。

```bash
cd app
npx expo prebuild -p ios --clean   # config plugin を native へ反映（ios/ を再生成）
npx pod-install                    # もしくは (cd ios && pod install)
npx expo run:ios                   # dev client をビルド＆起動
```

> `prebuild --clean` は `ios/` を再生成する。既存の手変更があれば退避してから実行する。

## 5. 動作確認

| プロバイダ | 端末 | 確認内容 |
|---|---|---|
| Google | シミュレータ可 | サインイン → セッション確立 → `profiles` 行作成 → サインアウト |
| Apple | **実機必須** | 同上（シミュレータでは Apple サインイン不可） |

通し確認:

1. サインイン画面 → Google / Apple でサインイン。
2. 初回サインイン後、Supabase の `profiles` に自分の行ができている（`display_name` が Google/Apple の氏名で埋まる）。
   - 確認 SQL 例: `select id, display_name, timezone, created_at from profiles;`
3. **アプリを再起動** → サインイン画面を経由せず「やりたい一覧」に入る（セッション復元）。
4. サインアウト → サインイン画面へ自動で戻る。
5. サインアウト状態でアプリ再起動 → サインイン画面が出る。

## スコープ外（別 Issue）

- サインイン後のオンボーディング（名前確認・ペア分岐）。
- `profiles` のペア境界 RLS、`pairs`/`invites`/`plans` 等のテーブルと RLS 一括実装。
  - 本 Issue のマイグレーションは、本人のみ自分の `profiles` 行を読み書きできる最小 RLS のみ。
