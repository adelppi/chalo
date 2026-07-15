-- push_tokens の unique 制約修正（adr/0007「profile_id ＋ expo_push_token に unique 制約」）。
-- 旧制約は expo_push_token 単独 unique だったため、同じ端末で別アカウントに
-- サインインし直すと、既存行の持ち主と異なる profile_id での upsert が
-- ON CONFLICT 経由の UPDATE 扱いとなり、push_tokens_update_own の USING 句
-- （本人の行のみ）に弾かれて 42501 になっていた。

drop index if exists public.push_tokens_expo_push_token_idx;

create unique index if not exists push_tokens_profile_id_expo_push_token_idx
  on public.push_tokens (profile_id, expo_push_token);
