-- profiles: Supabase Auth のユーザーに 1:1 で対応するプロフィール。
-- 定義は docs/data-model.md の profiles テーブルに従う。
-- 注意:
--   * pair_id の pairs への外部キーは pairs テーブル作成時に別 Issue で追加する。
--   * ペア相手の参照などペア境界の RLS ポリシーも別 Issue（RLS 一括実装）で追加する。
--   * ここでは本人のみが自分の行を読み書きできる最小 RLS のみを付与する。

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_url text,
  partner_nickname text,
  pair_id uuid,
  timezone text not null,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Supabase Auth ユーザーに 1:1 で対応するプロフィール（docs/data-model.md）。';
comment on column public.profiles.pair_id is '所属するペア。pairs テーブル作成時に外部キーを追加する（別 Issue）。未ペアなら null。';

alter table public.profiles enable row level security;

-- authenticated ロールへのテーブル権限（新規テーブルは既定で Data API に露出しないため明示的に付与）。
-- 行レベルの絞り込みは下の RLS ポリシーが担う。anon には付与しない。
grant select, insert, update on public.profiles to authenticated;

-- 本人のみ自分の行にアクセスできる最小ポリシー。
-- ペア相手の参照などペア境界のアクセス制御は別 Issue（RLS 一括実装）で追加する。
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
