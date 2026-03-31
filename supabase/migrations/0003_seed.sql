-- Migration: 0003_seed
-- Initial seed data: business settings and product categories.
-- Categories are managed via seed in the MVP (no admin UI — see ADR-009).

-- ============================================================
-- SETTINGS
-- ============================================================
insert into public.settings (key, value, description) values
  ('business_name',    'TechCell',                   'Nombre del negocio que aparece en el catálogo y mensajes de WhatsApp'),
  ('whatsapp_number',  '',                            'Número de WhatsApp del negocio con código de país, sin espacios ni guiones. Ej: 5491112345678'),
  ('business_hours',   'Lun–Vie 10–19 hs · Sáb 10–14 hs', 'Horarios de atención que se muestran en el catálogo público'),
  ('shipping_cost',    '0',                           'Costo de envío base en ARS (0 = gratis)'),
  ('min_order_amount', '0',                           'Monto mínimo de pedido en ARS (0 = sin mínimo)')
on conflict (key) do nothing;

-- ============================================================
-- CATEGORIES
-- Raíces (parent_id = null) — flat list para el MVP.
-- ============================================================
insert into public.categories (id, name, slug, sort_order, active) values
  (gen_random_uuid(), 'Celulares',   'celulares',   1, true),
  (gen_random_uuid(), 'Fundas',      'fundas',      2, true),
  (gen_random_uuid(), 'Accesorios',  'accesorios',  3, true),
  (gen_random_uuid(), 'Auriculares', 'auriculares', 4, true),
  (gen_random_uuid(), 'Parlantes',   'parlantes',   5, true),
  (gen_random_uuid(), 'Servicios',   'servicios',   6, true),
  (gen_random_uuid(), 'Repuestos',   'repuestos',   7, true)
on conflict (slug) do nothing;
