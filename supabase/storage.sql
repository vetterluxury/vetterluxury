-- ============================================================
-- VETTER LUXURY — CONFIGURAÇÃO DO SUPABASE STORAGE
-- ============================================================
-- Execute DEPOIS de supabase/schema.sql, também no SQL Editor.
-- Cria os buckets usados pelo site e as políticas de acesso:
--   - leitura pública (qualquer pessoa pode ver as imagens)
--   - escrita (upload/exclusão) somente para administradores
-- ============================================================

-- ---------- BUCKETS ----------
insert into storage.buckets (id, name, public)
values
  ('products', 'products', true),
  ('banners', 'banners', true),
  ('collections', 'collections', true)
on conflict (id) do nothing;

-- ---------- POLÍTICAS: LEITURA PÚBLICA ----------
create policy "Leitura pública de imagens de produtos"
  on storage.objects for select
  using (bucket_id = 'products');

create policy "Leitura pública de imagens de banners"
  on storage.objects for select
  using (bucket_id = 'banners');

create policy "Leitura pública de imagens de coleções"
  on storage.objects for select
  using (bucket_id = 'collections');

-- ---------- POLÍTICAS: ESCRITA SOMENTE ADMIN ----------
create policy "Somente admins enviam imagens de produtos"
  on storage.objects for insert
  with check (
    bucket_id = 'products'
    and exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "Somente admins atualizam imagens de produtos"
  on storage.objects for update
  using (
    bucket_id = 'products'
    and exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "Somente admins excluem imagens de produtos"
  on storage.objects for delete
  using (
    bucket_id = 'products'
    and exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "Somente admins enviam imagens de banners"
  on storage.objects for insert
  with check (
    bucket_id = 'banners'
    and exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "Somente admins atualizam imagens de banners"
  on storage.objects for update
  using (
    bucket_id = 'banners'
    and exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "Somente admins excluem imagens de banners"
  on storage.objects for delete
  using (
    bucket_id = 'banners'
    and exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "Somente admins enviam imagens de coleções"
  on storage.objects for insert
  with check (
    bucket_id = 'collections'
    and exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "Somente admins atualizam imagens de coleções"
  on storage.objects for update
  using (
    bucket_id = 'collections'
    and exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "Somente admins excluem imagens de coleções"
  on storage.objects for delete
  using (
    bucket_id = 'collections'
    and exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );
