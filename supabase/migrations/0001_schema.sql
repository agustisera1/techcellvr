-- Migration: 0001_schema
-- Creates all tables, functions, indexes and triggers for TechCell MVP.

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "unaccent";

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Wrapper to expose unaccent() as IMMUTABLE so it can be used
-- in GIN index expressions (see ADR-005).
create or replace function public.immutable_unaccent(text)
  returns text
  language sql
  immutable
  parallel safe
as $$
  select public.unaccent($1);
$$;

-- Generic trigger function to keep updated_at current.
create or replace function public.update_updated_at()
  returns trigger
  language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Generates sequential order numbers: ORD-0001, ORD-0002, ...
create sequence if not exists public.order_number_seq
  start with 1
  increment by 1
  no maxvalue
  cache 1;

create or replace function public.generate_order_number()
  returns trigger
  language plpgsql
as $$
begin
  new.order_number := 'ORD-' || lpad(nextval('public.order_number_seq')::text, 4, '0');
  return new;
end;
$$;

-- Records price changes in price_history automatically on UPDATE.
create or replace function public.record_price_history()
  returns trigger
  language plpgsql
as $$
begin
  if old.price is distinct from new.price then
    insert into public.price_history (product_id, old_price, new_price)
    values (new.id, old.price, new.price);
  end if;
  return new;
end;
$$;

-- Creates a profile row when a new user signs up via Supabase Auth.
create or replace function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- ============================================================
-- TABLES
-- ============================================================
-- Order: self-referential first, then FK dependencies.

-- categories (self-referential via parent_id)
create table if not exists public.categories (
  id          uuid        not null default gen_random_uuid(),
  parent_id   uuid,
  name        text        not null,
  slug        text        not null,
  description text,
  sort_order  integer     not null default 0,
  active      boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint categories_pkey primary key (id),
  constraint categories_slug_key unique (slug),
  constraint categories_parent_id_fkey foreign key (parent_id)
    references public.categories(id)
);

-- customers
create table if not exists public.customers (
  id         uuid        not null default gen_random_uuid(),
  name       text        not null,
  phone      text        not null,
  email      text,
  address    text,
  city       text,
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_pkey     primary key (id),
  constraint customers_phone_key unique (phone)
);

-- products
create table if not exists public.products (
  id                 uuid        not null default gen_random_uuid(),
  category_id        uuid,
  name               text        not null,
  slug               text        not null,
  description        text,
  sku                text,
  price              numeric     not null check (price >= 0),
  compare_at_price   numeric     check (compare_at_price >= 0),
  stock              integer     not null default 0 check (stock >= 0),
  stock_min_threshold integer    default 0,
  active             boolean     not null default true,
  featured           boolean     not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint products_pkey        primary key (id),
  constraint products_slug_key    unique (slug),
  constraint products_sku_key     unique (sku),
  constraint products_category_id_fkey foreign key (category_id)
    references public.categories(id)
);

-- discounts
create table if not exists public.discounts (
  id          uuid        not null default gen_random_uuid(),
  product_id  uuid        not null,
  percentage  numeric     not null check (percentage > 0 and percentage <= 100),
  reason      text,
  valid_from  timestamptz,
  valid_until timestamptz,
  active      boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint discounts_pkey       primary key (id),
  constraint discounts_product_id_fkey foreign key (product_id)
    references public.products(id)
);

-- product_images
create table if not exists public.product_images (
  id          uuid        not null default gen_random_uuid(),
  product_id  uuid        not null,
  url         text        not null,
  alt_text    text,
  sort_order  integer     not null default 0,
  is_primary  boolean     not null default false,
  created_at  timestamptz not null default now(),
  constraint product_images_pkey       primary key (id),
  constraint product_images_product_id_fkey foreign key (product_id)
    references public.products(id)
);

-- orders
create table if not exists public.orders (
  id               uuid        not null default gen_random_uuid(),
  order_number     text        not null,
  customer_id      uuid        not null,
  status           text        not null default 'pending'
    check (status in ('pending','confirmed','preparing','shipped','delivered','cancelled')),
  delivery_type    text        not null default 'shipping'
    check (delivery_type in ('shipping','pickup')),
  delivery_address text,
  subtotal         numeric     not null default 0,
  shipping_cost    numeric     not null default 0,
  discount_total   numeric     not null default 0,
  total            numeric     not null default 0,
  payment_status   text        not null default 'pending'
    check (payment_status in ('pending','paid','failed','refunded')),
  payment_method   text
    check (payment_method in ('whatsapp','mercadopago','cash')),
  mp_payment_id    text,
  mp_preference_id text,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint orders_pkey             primary key (id),
  constraint orders_order_number_key unique (order_number),
  constraint orders_customer_id_fkey foreign key (customer_id)
    references public.customers(id)
);

-- order_items
create table if not exists public.order_items (
  id               uuid        not null default gen_random_uuid(),
  order_id         uuid        not null,
  product_id       uuid,
  product_name     text        not null,
  product_sku      text,
  quantity         integer     not null check (quantity > 0),
  unit_price       numeric     not null,
  discount_applied numeric     not null default 0,
  subtotal         numeric     not null,
  created_at       timestamptz not null default now(),
  constraint order_items_pkey        primary key (id),
  constraint order_items_order_id_fkey foreign key (order_id)
    references public.orders(id),
  constraint order_items_product_id_fkey foreign key (product_id)
    references public.products(id)
);

-- profiles (linked to auth.users)
create table if not exists public.profiles (
  id         uuid        not null,
  email      text,
  full_name  text,
  avatar_url text,
  role       text        not null default 'admin',
  active     boolean     not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_pkey  primary key (id),
  constraint profiles_id_fkey foreign key (id)
    references auth.users(id) on delete cascade
);

-- price_history
create table if not exists public.price_history (
  id          uuid        not null default gen_random_uuid(),
  product_id  uuid        not null,
  changed_by  uuid,
  old_price   numeric     not null,
  new_price   numeric     not null,
  changed_at  timestamptz not null default now(),
  constraint price_history_pkey           primary key (id),
  constraint price_history_product_id_fkey foreign key (product_id)
    references public.products(id),
  constraint price_history_changed_by_fkey foreign key (changed_by)
    references public.profiles(id)
);

-- stock_movements
create table if not exists public.stock_movements (
  id            uuid        not null default gen_random_uuid(),
  product_id    uuid        not null,
  moved_by      uuid,
  order_item_id uuid,
  type          text        not null
    check (type in ('sale','manual_entry','adjustment','return','initial')),
  quantity      integer     not null,
  stock_before  integer     not null,
  stock_after   integer     not null,
  reason        text,
  created_at    timestamptz not null default now(),
  constraint stock_movements_pkey              primary key (id),
  constraint stock_movements_product_id_fkey   foreign key (product_id)
    references public.products(id),
  constraint stock_movements_moved_by_fkey     foreign key (moved_by)
    references public.profiles(id),
  constraint stock_movements_order_item_id_fkey foreign key (order_item_id)
    references public.order_items(id)
);

-- settings (key-value store for business configuration)
create table if not exists public.settings (
  id          uuid        not null default gen_random_uuid(),
  key         text        not null,
  value       text,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint settings_pkey    primary key (id),
  constraint settings_key_key unique (key)
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Full-text search on products (see ADR-005 and CLAUDE.md)
create index if not exists products_search_idx
  on public.products
  using gin(
    to_tsvector('spanish',
      public.immutable_unaccent(coalesce(name, '')) || ' ' ||
      public.immutable_unaccent(coalesce(description, ''))
    )
  );

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_active_idx   on public.products(active);

create index if not exists orders_customer_idx   on public.orders(customer_id);
create index if not exists orders_status_idx     on public.orders(status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

create index if not exists order_items_order_idx   on public.order_items(order_id);
create index if not exists order_items_product_idx on public.order_items(product_id);

create index if not exists stock_movements_product_idx    on public.stock_movements(product_id);
create index if not exists stock_movements_created_at_idx on public.stock_movements(created_at desc);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- updated_at triggers
create trigger set_updated_at_categories
  before update on public.categories
  for each row execute function public.update_updated_at();

create trigger set_updated_at_customers
  before update on public.customers
  for each row execute function public.update_updated_at();

create trigger set_updated_at_products
  before update on public.products
  for each row execute function public.update_updated_at();

create trigger set_updated_at_discounts
  before update on public.discounts
  for each row execute function public.update_updated_at();

create trigger set_updated_at_orders
  before update on public.orders
  for each row execute function public.update_updated_at();

create trigger set_updated_at_settings
  before update on public.settings
  for each row execute function public.update_updated_at();

create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute function public.update_updated_at();

-- Auto-generate order_number on INSERT
create trigger set_order_number
  before insert on public.orders
  for each row execute function public.generate_order_number();

-- Record price changes automatically
create trigger on_price_change
  after update on public.products
  for each row execute function public.record_price_history();

-- Create profile when a new auth user is created
-- Drop first in case Supabase already created a default trigger with this name.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
