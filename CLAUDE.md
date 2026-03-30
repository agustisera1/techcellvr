# CLAUDE.md

Contexto completo del proyecto en `PROJECT_CONTEXT.md`. Leerlo antes de cualquier tarea.

## Stack

Next.js 14 App Router · TypeScript · Supabase · Tailwind · shadcn/ui · TanStack Table v8 · TanStack Query v5 · Zustand · Zod

## Reglas absolutas

- **Nunca** importar `src/lib/supabase/admin.ts` en Client Components. Solo en Server Actions y Route Handlers.
- **Nunca** usar `SUPABASE_SERVICE_ROLE_KEY` con prefijo `NEXT_PUBLIC_`.
- **Nunca** modificar archivos en `src/components/ui/` directamente — son primitivos de shadcn.
- **Nunca** hacer fetch a Supabase desde el cliente en rutas ISR del catálogo, excepto `ProductSearchBar`.
- El stock se descuenta **solo** cuando `payment_status = 'paid'` (webhook MP). No al confirmar el pedido.
- Los pedidos por WhatsApp: primero POST a `/api/orders`, luego abrir `wa.me`. Nunca al revés.
- `order_items` siempre guarda snapshot de `product_name`, `product_sku` y `unit_price` al momento de la compra.

## Estructura de módulos

```
/admin/*          → SSR, protegido por middleware, requiere sesión Supabase Auth
/(catalog)/*      → ISR revalidate:30, público
/api/orders       → Route Handler público (crea pedidos desde catálogo)
/api/revalidate   → Route Handler protegido con REVALIDATE_SECRET
/api/healthcheck  → Cron anti-pausa Supabase (cada 3 días via vercel.json)
/api/webhooks/mp  → Webhook MercadoPago (futuro)
```

## Clientes Supabase

```typescript
import { createClient } from '@/lib/supabase/server'   // Server Components, Actions, Route Handlers
import { createClient } from '@/lib/supabase/client'   // Solo Realtime y casos edge client-side
import { createAdminClient } from '@/lib/supabase/admin' // Bypass RLS — solo server-side
```

## Convenciones de código

- Server Components por defecto. Agregar `'use client'` solo cuando sea necesario.
- Server Actions en `src/app/admin/*/actions.ts` — nunca en Route Handlers para mutaciones del admin.
- Validar inputs con Zod antes de cualquier operación en DB. Schemas en `src/lib/validations/`.
- Tipos de DB generados automáticamente en `src/lib/database.types.ts`. Regenerar con:
  ```bash
  npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts
  ```
- Slugs generados desde el nombre del producto via `src/lib/utils/slug.ts`.
- Links de WhatsApp construidos via `src/lib/utils/whatsapp.ts`.
- Formatters de precio y fecha en `src/lib/utils/format.ts`. Moneda: ARS.

## Componentes

- `DataTable` en `src/components/shared/DataTable.tsx` es el wrapper genérico de TanStack Table. Usarlo como base para todas las tablas del admin.
- `StatusBadge` mapea estados de orders/payments a colores semánticos.
- `ImageUploader` comprime imágenes a ~200-300 KB antes de subir a Supabase Storage bucket `product-images`.
- `OrdersRealtimeListener` se monta en `AdminLayout` — suscribe a INSERT en `orders` y dispara toast.

## Búsqueda full-text

```sql
-- Query de búsqueda de productos (usa índice GIN existente)
select * from products
where to_tsvector('spanish',
    public.immutable_unaccent(coalesce(name,'')) || ' ' ||
    public.immutable_unaccent(coalesce(description,'')))
  @@ plainto_tsquery('spanish', public.immutable_unaccent($1))
  and active = true;
```

## Estado del carrito

Zustand store en `src/lib/store/cart.ts`. Persiste en `sessionStorage` (no localStorage — se limpia al cerrar el tab, comportamiento esperado para un e-commerce).

## RLS actual

Development: policies `dev: full access` en todas las tablas (`using (true)`). Reemplazar por policies estrictas antes de producción. Ver `PROJECT_CONTEXT.md` para el detalle de policies de producción.

## Migraciones

Versionadas en `supabase/migrations/`. Al cambiar el schema:
1. Crear archivo `NNNN_descripcion.sql` en `supabase/migrations/`
2. Correr `supabase db push`
3. Regenerar tipos TypeScript

## Variables de entorno necesarias

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_WHATSAPP_NUMBER
SUPABASE_SERVICE_ROLE_KEY
REVALIDATE_SECRET
```

## MVP vs v2

**MVP activo:** Auth admin, ABM productos, gestión de pedidos, catálogo ISR, carrito, checkout WhatsApp, Realtime, reportes básicos.

**v2:** MercadoPago, ingreso de stock via IA (foto de factura), escaneo de código de barras, importación CSV, roles adicionales, RLS estricto.
