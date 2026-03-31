-- Migration: 0002_rls
-- Row Level Security — development policies (full access).
-- Replace with strict policies before going to production (see CLAUDE.md → RLS actual).

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================
alter table public.categories      enable row level security;
alter table public.customers       enable row level security;
alter table public.products        enable row level security;
alter table public.discounts       enable row level security;
alter table public.product_images  enable row level security;
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;
alter table public.profiles        enable row level security;
alter table public.price_history   enable row level security;
alter table public.stock_movements enable row level security;
alter table public.settings        enable row level security;

-- ============================================================
-- DEV POLICIES — full access (using true)
-- ============================================================
create policy "dev: full access" on public.categories      using (true) with check (true);
create policy "dev: full access" on public.customers       using (true) with check (true);
create policy "dev: full access" on public.products        using (true) with check (true);
create policy "dev: full access" on public.discounts       using (true) with check (true);
create policy "dev: full access" on public.product_images  using (true) with check (true);
create policy "dev: full access" on public.orders          using (true) with check (true);
create policy "dev: full access" on public.order_items     using (true) with check (true);
create policy "dev: full access" on public.profiles        using (true) with check (true);
create policy "dev: full access" on public.price_history   using (true) with check (true);
create policy "dev: full access" on public.stock_movements using (true) with check (true);
create policy "dev: full access" on public.settings        using (true) with check (true);
