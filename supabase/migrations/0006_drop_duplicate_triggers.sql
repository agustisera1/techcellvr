-- Migration: 0006_drop_duplicate_triggers
-- Removes duplicate triggers left over from the Supabase project template
-- that were causing double entries in price_history and stock_movements.

drop trigger if exists products_price_change on public.products;
drop trigger if exists products_stock_change  on public.products;
drop trigger if exists products_updated_at    on public.products;
