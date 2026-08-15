-- ============================================================
-- VETTER LUXURY — SCHEMA COMPLETO SUPABASE
-- ============================================================
-- Execute este arquivo inteiro no SQL Editor do seu projeto Supabase
-- (Supabase Dashboard > SQL Editor > New query > cole tudo > Run).
-- Ordem: extensões > tabelas > índices > triggers > RLS.
-- ============================================================

-- ---------- EXTENSÕES ----------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------- FUNÇÃO UTILITÁRIA: updated_at automático ----------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- PROFILES (estende auth.users do Supabase Auth)
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  cpf text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Cria profile automaticamente quando um usuário se cadastra
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Endereços do cliente (um cliente pode ter vários)
create table if not exists addresses (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references profiles(id) on delete cascade,
  label text default 'Principal',
  recipient_name text not null,
  street text not null,
  number text not null,
  complement text,
  neighborhood text not null,
  city text not null,
  state text not null,
  zip_code text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_addresses_profile on addresses(profile_id);

-- ============================================================
-- CATEGORIAS
-- ============================================================
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_categories_updated_at
  before update on categories
  for each row execute function set_updated_at();

-- ============================================================
-- COLEÇÕES
-- ============================================================
create table if not exists collections (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  banner_url text,
  is_active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_collections_updated_at
  before update on collections
  for each row execute function set_updated_at();

-- ============================================================
-- PRODUCTS
-- ============================================================
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  additional_info text,
  price numeric(10,2) not null default 0,
  promo_price numeric(10,2),
  sku text unique,
  category_id uuid references categories(id) on delete set null,
  collection_id uuid references collections(id) on delete set null,
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  main_image_url text,
  status text not null default 'active' check (status in ('active','inactive','draft')),
  is_featured boolean not null default false,
  is_new boolean not null default false,
  is_on_sale boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_products_slug on products(slug);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_collection on products(collection_id);
create index if not exists idx_products_status on products(status);
create trigger trg_products_updated_at
  before update on products
  for each row execute function set_updated_at();

-- Múltiplas imagens por produto
create table if not exists product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_product_images_product on product_images(product_id);

-- Variantes (tamanho + cor) — usadas para estoque granular
create table if not exists product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  size text not null,
  color text not null,
  sku_variant text,
  created_at timestamptz not null default now(),
  unique (product_id, size, color)
);
create index if not exists idx_product_variants_product on product_variants(product_id);

-- Estoque por variante
create table if not exists inventory (
  id uuid primary key default uuid_generate_v4(),
  variant_id uuid not null references product_variants(id) on delete cascade unique,
  quantity int not null default 0 check (quantity >= 0),
  low_stock_threshold int not null default 3,
  updated_at timestamptz not null default now()
);
create trigger trg_inventory_updated_at
  before update on inventory
  for each row execute function set_updated_at();

-- ============================================================
-- FAVORITOS
-- ============================================================
create table if not exists favorites (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (profile_id, product_id)
);
create index if not exists idx_favorites_profile on favorites(profile_id);

-- ============================================================
-- CARRINHO (persistido para usuário logado)
-- ============================================================
create table if not exists carts (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade,
  session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_carts_updated_at
  before update on carts
  for each row execute function set_updated_at();

create table if not exists cart_items (
  id uuid primary key default uuid_generate_v4(),
  cart_id uuid not null references carts(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete set null,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now()
);
create index if not exists idx_cart_items_cart on cart_items(cart_id);

-- ============================================================
-- CUPONS
-- ============================================================
create table if not exists coupons (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage','fixed')),
  discount_value numeric(10,2) not null,
  min_order_value numeric(10,2) default 0,
  is_active boolean not null default true,
  starts_at timestamptz,
  expires_at timestamptz,
  usage_limit int,
  created_at timestamptz not null default now()
);

create table if not exists coupon_usages (
  id uuid primary key default uuid_generate_v4(),
  coupon_id uuid not null references coupons(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  order_id uuid,
  used_at timestamptz not null default now()
);

-- ============================================================
-- PEDIDOS
-- ============================================================
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique,
  profile_id uuid references profiles(id) on delete set null,
  subtotal numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  coupon_id uuid references coupons(id) on delete set null,
  payment_method text check (payment_method in ('pix','credit_card','cash')),
  payment_status text not null default 'pending' check (payment_status in ('pending','approved','rejected','refunded')),
  order_status text not null default 'payment_pending' check (
    order_status in ('payment_pending','payment_approved','preparing','shipped','delivered','cancelled')
  ),
  shipping_address jsonb,
  tracking_code text,
  mp_payment_id text,
  mp_preference_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_orders_profile on orders(profile_id);
create index if not exists idx_orders_status on orders(order_status);
create trigger trg_orders_updated_at
  before update on orders
  for each row execute function set_updated_at();

create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id) on delete set null,
  product_name text not null,
  size text,
  color text,
  unit_price numeric(10,2) not null,
  quantity int not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_order_items_order on order_items(order_id);

-- ============================================================
-- BANNERS (home / coleções)
-- ============================================================
create table if not exists banners (
  id uuid primary key default uuid_generate_v4(),
  title text,
  subtitle text,
  image_url text not null,
  link_url text,
  placement text not null default 'home' check (placement in ('home','collection','category')),
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_banners_updated_at
  before update on banners
  for each row execute function set_updated_at();

-- ============================================================
-- CONFIGURAÇÕES DO SITE (chave/valor, editável pelo admin)
-- ============================================================
create table if not exists site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
create trigger trg_site_settings_updated_at
  before update on site_settings
  for each row execute function set_updated_at();

insert into site_settings (key, value) values
  ('whatsapp_number', '"5551996767044"'),
  ('contact_email', '"vetterluxury@gmail.com"'),
  ('instagram_handle', '"vetterluxury"')
on conflict (key) do nothing;

-- ============================================================
-- PAGAMENTOS (log de pagamentos Mercado Pago)
-- ============================================================
create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  provider text not null default 'mercado_pago',
  provider_payment_id text,
  status text not null,
  amount numeric(10,2) not null,
  raw_payload jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_payments_order on payments(order_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- ---------- PROFILES ----------
alter table profiles enable row level security;

create policy "Usuários podem ver o próprio perfil"
  on profiles for select
  using (auth.uid() = id);

create policy "Usuários podem atualizar o próprio perfil"
  on profiles for update
  using (auth.uid() = id);

create policy "Admins podem ver todos os perfis"
  on profiles for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

-- ---------- ADDRESSES ----------
alter table addresses enable row level security;

create policy "Usuários gerenciam os próprios endereços"
  on addresses for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- ---------- CATEGORIES / COLLECTIONS (leitura pública, escrita só admin) ----------
alter table categories enable row level security;
alter table collections enable row level security;

create policy "Categorias visíveis para todos"
  on categories for select
  using (true);

create policy "Somente admins alteram categorias"
  on categories for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "Coleções visíveis para todos"
  on collections for select
  using (true);

create policy "Somente admins alteram coleções"
  on collections for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

-- ---------- PRODUCTS (leitura pública de produtos ativos, escrita só admin) ----------
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_variants enable row level security;
alter table inventory enable row level security;

create policy "Produtos ativos visíveis para todos"
  on products for select
  using (status = 'active' or exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "Somente admins alteram produtos"
  on products for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "Imagens de produto visíveis para todos"
  on product_images for select using (true);
create policy "Somente admins alteram imagens de produto"
  on product_images for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "Variantes visíveis para todos"
  on product_variants for select using (true);
create policy "Somente admins alteram variantes"
  on product_variants for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "Estoque visível para todos"
  on inventory for select using (true);
create policy "Somente admins alteram estoque"
  on inventory for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

-- ---------- FAVORITES ----------
alter table favorites enable row level security;

create policy "Usuários gerenciam os próprios favoritos"
  on favorites for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- ---------- CARTS / CART_ITEMS ----------
alter table carts enable row level security;
alter table cart_items enable row level security;

create policy "Usuários gerenciam o próprio carrinho"
  on carts for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "Usuários gerenciam os itens do próprio carrinho"
  on cart_items for all
  using (exists (select 1 from carts c where c.id = cart_id and c.profile_id = auth.uid()))
  with check (exists (select 1 from carts c where c.id = cart_id and c.profile_id = auth.uid()));

-- ---------- COUPONS (leitura pública de ativos, escrita só admin) ----------
alter table coupons enable row level security;
alter table coupon_usages enable row level security;

create policy "Cupons ativos visíveis para todos"
  on coupons for select
  using (is_active = true or exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "Somente admins alteram cupons"
  on coupons for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "Usuários registram o próprio uso de cupom"
  on coupon_usages for insert
  with check (auth.uid() = profile_id);

create policy "Admins veem uso de cupons"
  on coupon_usages for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

-- ---------- ORDERS / ORDER_ITEMS ----------
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "Usuários veem os próprios pedidos"
  on orders for select
  using (auth.uid() = profile_id or exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "Usuários criam os próprios pedidos"
  on orders for insert
  with check (auth.uid() = profile_id);

create policy "Somente admins atualizam pedidos"
  on orders for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "Usuários veem itens dos próprios pedidos"
  on order_items for select
  using (exists (
    select 1 from orders o where o.id = order_id
    and (o.profile_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true))
  ));

create policy "Usuários criam itens dos próprios pedidos"
  on order_items for insert
  with check (exists (select 1 from orders o where o.id = order_id and o.profile_id = auth.uid()));

-- ---------- BANNERS (leitura pública, escrita só admin) ----------
alter table banners enable row level security;

create policy "Banners ativos visíveis para todos"
  on banners for select
  using (is_active = true or exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "Somente admins alteram banners"
  on banners for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

-- ---------- SITE_SETTINGS (leitura pública, escrita só admin) ----------
alter table site_settings enable row level security;

create policy "Configurações visíveis para todos"
  on site_settings for select using (true);

create policy "Somente admins alteram configurações"
  on site_settings for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

-- ---------- PAYMENTS (somente admin e webhook via service role) ----------
alter table payments enable row level security;

create policy "Admins veem pagamentos"
  on payments for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

-- Observação: o webhook do Mercado Pago (rota server-side) usa a
-- SUPABASE_SERVICE_ROLE_KEY, que ignora RLS — por isso não é necessária
-- uma policy de "insert" pública aqui.

-- ============================================================
-- COMO TORNAR UM USUÁRIO ADMINISTRADOR
-- ============================================================
-- Depois de criar sua conta pelo /cadastro do site, rode no SQL Editor:
--
-- update profiles set is_admin = true where id = (
--   select id from auth.users where email = 'seu-email@exemplo.com'
-- );
-- ============================================================
