# Stock Manager — Contexto del Proyecto

## Descripción general

Sistema de gestión de stock para un negocio de tecnología (celulares, fundas, cargadores, auriculares y accesorios). Contempla dos módulos bien diferenciados: un panel de administración privado y un catálogo público con carrito de compras y checkout vía WhatsApp.

El sistema está diseñado para escalar hacia pagos online con MercadoPago en una segunda iteración.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript |
| Base de datos | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime |
| Hosting | Vercel (Hobby tier) |
| Estilos | Tailwind CSS |
| Componentes UI | shadcn/ui |
| Tablas | TanStack Table v8 |
| Fetching / cache | TanStack Query v5 |
| Estado global | Zustand (carrito del catálogo) |
| Validación | Zod |
| Pagos (futuro) | MercadoPago Checkout Pro |

---

## Arquitectura de módulos

### Módulo Admin (SSR)
- Rutas protegidas bajo `/admin/*`
- Renderizado server-side en cada request
- Acceso exclusivo con autenticación Supabase Auth
- Un único usuario administrador (gestionado manualmente en el dashboard de Supabase)
- Protegido por `src/middleware.ts` que intercepta todas las rutas `/admin/*` y redirige a `/admin/login` si no hay sesión

### Módulo Catálogo (ISR)
- Rutas públicas, sin autenticación
- ISR con `revalidate: 30` segundos
- Revalidación bajo demanda via `revalidatePath()` al guardar un producto desde el admin
- Endpoint `/api/revalidate` protegido con `REVALIDATE_SECRET`
- La búsqueda de productos es la única excepción al ISR: usa TanStack Query client-side con debounce

### Estrategia de rendering por ruta

```
/                        → ISR (catálogo principal)
/p/[slug]                → ISR (página de producto)
/[category]              → ISR (catálogo filtrado por categoría)
/checkout                → Client Component
/admin/login             → SSR
/admin/*                 → SSR (protegido por middleware)
/api/orders              → Route Handler (recibe pedidos del catálogo)
/api/revalidate          → Route Handler (trigger ISR bajo demanda)
/api/admin/*             → Route Handlers (operaciones del panel)
/api/webhooks/mp         → Route Handler (webhook MercadoPago, futuro)
/api/healthcheck         → Route Handler (cron anti-pausa Supabase)
```

---

## Estructura de carpetas

```
src/
├── app/
│   ├── admin/                    ← Módulo Admin (SSR, protegido)
│   │   ├── layout.tsx            ← AdminLayout: verifica sesión, monta Sidebar + Navbar
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── page.tsx              ← Dashboard
│   │   ├── productos/
│   │   │   ├── page.tsx          ← Lista de productos
│   │   │   └── [id]/
│   │   │       └── page.tsx      ← Alta / edición de producto
│   │   ├── pedidos/
│   │   │   └── page.tsx
│   │   ├── stock/
│   │   │   └── page.tsx
│   │   ├── reportes/
│   │   │   └── page.tsx
│   │   └── configuracion/
│   │       └── page.tsx
│   ├── (catalog)/                ← Módulo Catálogo (ISR, público)
│   │   ├── layout.tsx            ← CatalogNavbar + BusinessHoursBanner
│   │   ├── page.tsx              ← Catálogo principal
│   │   ├── [category]/
│   │   │   └── page.tsx          ← Catálogo filtrado por categoría
│   │   ├── p/
│   │   │   └── [slug]/
│   │   │       └── page.tsx      ← Página de producto
│   │   └── checkout/
│   │       └── page.tsx          ← Client Component
│   └── api/
│       ├── admin/                ← Endpoints del panel (requieren service_role)
│       ├── orders/
│       │   └── route.ts          ← POST: crear pedido desde catálogo
│       ├── revalidate/
│       │   └── route.ts          ← POST: trigger revalidación ISR
│       ├── healthcheck/
│       │   └── route.ts          ← GET: ping anti-pausa Supabase
│       └── webhooks/
│           └── mp/
│               └── route.ts      ← POST: webhook MercadoPago (futuro)
├── components/
│   ├── ui/                       ← Primitivos shadcn (nunca modificar directamente)
│   ├── admin/
│   │   ├── layout/
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── AdminNavbar.tsx
│   │   │   └── StockAlertBanner.tsx
│   │   ├── products/
│   │   │   ├── ProductsTable.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── ProductFilters.tsx
│   │   │   ├── DiscountForm.tsx
│   │   │   ├── PriceHistoryDrawer.tsx
│   │   │   └── StockAdjustForm.tsx
│   │   ├── orders/
│   │   │   ├── OrdersTable.tsx
│   │   │   ├── OrderDetailDrawer.tsx
│   │   │   ├── OrderStatusUpdater.tsx
│   │   │   ├── OrderFilters.tsx
│   │   │   ├── OrdersRealtimeListener.tsx
│   │   │   └── WhatsAppContactButton.tsx
│   │   └── dashboard/
│   │       ├── StatsCard.tsx
│   │       ├── TopProductsTable.tsx
│   │       ├── PendingOrdersWidget.tsx
│   │       ├── LowStockTable.tsx
│   │       └── SalesChart.tsx        ← v2
│   ├── catalog/
│   │   ├── CatalogNavbar.tsx
│   │   ├── CategorySidebar.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductSearchBar.tsx
│   │   ├── CartDrawer.tsx
│   │   ├── CheckoutForm.tsx
│   │   ├── CheckoutSummary.tsx
│   │   ├── WhatsAppOrderButton.tsx
│   │   └── BusinessHoursBanner.tsx
│   └── shared/
│       ├── DataTable.tsx             ← Wrapper genérico TanStack Table
│       ├── ConfirmDialog.tsx
│       ├── StatusBadge.tsx
│       ├── ImageUploader.tsx
│       └── EmptyState.tsx
├── lib/
│   ├── supabase/
│   │   ├── server.ts                 ← Cliente SSR (usa cookies, @supabase/ssr)
│   │   ├── client.ts                 ← Cliente browser (solo Realtime y casos edge)
│   │   └── admin.ts                  ← Cliente service_role (solo server-side)
│   ├── database.types.ts             ← Generado: npx supabase gen types typescript
│   ├── validations/
│   │   ├── product.ts                ← Zod schemas para productos
│   │   ├── order.ts                  ← Zod schemas para pedidos
│   │   └── settings.ts
│   ├── utils/
│   │   ├── format.ts                 ← Formatters de precio, fecha, etc.
│   │   ├── slug.ts                   ← Generador de slugs desde nombre
│   │   └── whatsapp.ts               ← Builder de mensajes wa.me
│   └── store/
│       └── cart.ts                   ← Zustand store del carrito
├── middleware.ts                     ← Protección de rutas /admin/*
└── supabase/
    └── migrations/                   ← Migraciones versionadas (Supabase CLI)
        └── 0001_init_schema.sql
```

---

## Variables de entorno

```env
# Públicas (expuestas al cliente)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_WHATSAPP_NUMBER=      # formato: 5491100000000 (sin +)

# Privadas (solo server-side)
SUPABASE_SERVICE_ROLE_KEY=        # nunca con prefijo NEXT_PUBLIC_
REVALIDATE_SECRET=                # token para el endpoint /api/revalidate

# MercadoPago (agregar cuando se integre)
MP_ACCESS_TOKEN_SANDBOX=
MP_ACCESS_TOKEN_PROD=
MP_WEBHOOK_SECRET=
```

---

## Base de datos — Modelo de datos

### Esquema `public`

Todas las tablas viven en `public`. El esquema `auth` es exclusivo de Supabase y no se modifica.

#### `profiles`
Mirror de `auth.users` con datos custom. Se popula automáticamente via trigger `on_auth_user_created` al crear un usuario en Supabase Auth.

| Campo | Tipo | Notas |
|---|---|---|
| id | uuid PK | FK → auth.users(id) ON DELETE CASCADE |
| email | text | Copiado de auth.users |
| full_name | text | |
| avatar_url | text | |
| role | text | 'admin' \| 'operator' (futuro) |
| active | boolean | default true |
| created_at | timestamptz | |
| updated_at | timestamptz | Auto via trigger |

#### `settings`
Configuración global del negocio en formato clave/valor.

Keys pre-cargadas: `business_name`, `whatsapp_number`, `shipping_cost`, `currency`, `min_order_amount`, `business_hours`, `pickup_available`, `catalog_active`.

#### `categories`
Árbol de categorías con soporte de subcategorías (self-referencing via `parent_id`). Máximo 2 niveles recomendados para la UI.

#### `products`
| Campo | Notas |
|---|---|
| price | Precio actual |
| compare_at_price | Precio original tachado (nullable) |
| stock | Unidades disponibles |
| stock_min_threshold | Umbral de alerta de stock bajo |
| featured | Destacado en catálogo |
| slug | Único, auto-generado desde el nombre |

**Triggers automáticos:**
- `products_price_change` → inserta en `price_history` al cambiar `price`
- `products_stock_change` → inserta en `stock_movements` (tipo `adjustment`) al cambiar `stock` manualmente
- `products_updated_at` → actualiza `updated_at`

**Índice de búsqueda:**
```sql
-- Usa immutable_unaccent() wrapper para soporte de tildes en español
create index products_search_idx on products using gin (
  to_tsvector('spanish',
    public.immutable_unaccent(coalesce(name,'')) || ' ' ||
    public.immutable_unaccent(coalesce(description,''))
  )
);
```

Query de búsqueda correspondiente:
```sql
select * from products
where to_tsvector('spanish',
    public.immutable_unaccent(coalesce(name,'')) || ' ' ||
    public.immutable_unaccent(coalesce(description,'')))
  @@ plainto_tsquery('spanish', public.immutable_unaccent('término de búsqueda'))
  and active = true;
```

#### `discounts`
Descuentos por porcentaje con vigencia opcional. Uso principal: rotación de productos de generación anterior. Separado de `compare_at_price` (que es solo visual/editorial).

#### `price_history`
Log **inmutable** de cambios de precio. Se popula automáticamente via trigger. Nunca se modifica manualmente.

#### `customers`
Datos del cliente capturados en el checkout. Sin sistema de login — identificados por teléfono.

#### `orders`

Estados de `status`: `pending` → `confirmed` → `preparing` → `shipped` → `delivered` | `cancelled`

Estados de `payment_status`: `pending` → `paid` | `failed` | `refunded`

Métodos de `payment_method`: `whatsapp` | `mercadopago` | `cash`

**Flujo de pedido por WhatsApp:**
1. Cliente completa `CheckoutForm` en el catálogo
2. `WhatsAppOrderButton` hace POST a `/api/orders` → crea `customer` + `order` + `order_items` en DB con `status: pending`, `payment_method: whatsapp`
3. Si el POST es exitoso → abre `wa.me/NUMERO?text=...` con resumen pre-armado
4. Admin ve el pedido en el panel en tiempo real (Supabase Realtime)
5. Admin contacta al cliente por WhatsApp para confirmar
6. Admin cambia el estado del pedido desde el panel

**Flujo de pago MercadoPago (futuro):**
1. Se crea preferencia MP desde `/api/admin/mp/preference`
2. Cliente paga en checkout de MP
3. Webhook en `/api/webhooks/mp` recibe notificación de acreditación
4. Se actualiza `payment_status: paid` y se descuenta stock

#### `order_items`
Snapshot del producto al momento de la compra. Los campos `product_name`, `product_sku` y `unit_price` se copian del producto — si el producto cambia de precio después, el pedido histórico no se ve afectado.

#### `stock_movements`
Log **inmutable** de cada entrada/salida de stock.

Tipos: `sale` | `manual_entry` | `adjustment` | `return` | `initial`

- `quantity` positivo = entrada, negativo = salida
- `order_item_id` nullable: si el movimiento viene de una venta apunta al ítem; si es manual, es null
- Los ajustes manuales desde el panel admin se registran con tipo `adjustment`
- Las ventas deben registrarse explícitamente desde la Server Action con tipo `sale` (el trigger del producto registra `adjustment`, no `sale`)

---

## Row Level Security

**Estado actual: desarrollo flexible**

Todas las tablas tienen RLS habilitado con policies `dev: full access` (`using (true) with check (true)`). Identificadas con prefijo `dev:` para reemplazar antes de producción.

**Policies de producción a implementar:**
- `anon` puede SELECT en `products` y `categories` donde `active = true`
- `anon` puede SELECT en `settings`
- `anon` no puede leer `customers`, `orders`, `order_items`, `stock_movements`, `price_history`, `profiles`
- Escrituras en todas las tablas: solo `service_role` (desde server-side)
- `profiles`: usuario autenticado puede leer y actualizar su propio perfil (`auth.uid() = id`)

---

## Clientes de Supabase

```typescript
// src/lib/supabase/server.ts
// Usar en: Server Components, Server Actions, Route Handlers
// Maneja cookies automáticamente para SSR
import { createServerClient } from '@supabase/ssr'

// src/lib/supabase/client.ts
// Usar en: Client Components (solo Realtime y casos edge)
import { createBrowserClient } from '@supabase/ssr'

// src/lib/supabase/admin.ts
// Usar en: Server Actions y Route Handlers que necesitan bypass de RLS
// NUNCA importar en Client Components
import { createClient } from '@supabase/supabase-js'
// Inicializar con SUPABASE_SERVICE_ROLE_KEY
```

---

## Middleware de autenticación

`src/middleware.ts` intercepta todas las rutas `/admin/*`. Si no hay sesión de Supabase Auth válida, redirige a `/admin/login`. Las rutas del catálogo pasan sin verificación. Corre en Edge Runtime.

---

## Supabase Realtime

El componente `OrdersRealtimeListener` se monta en el `AdminLayout` y suscribe al canal de INSERT en la tabla `orders`. Cuando llega un pedido nuevo muestra un toast (shadcn Toaster) sin necesidad de refrescar la página.

```typescript
// Patrón de suscripción
const channel = supabase
  .channel('orders-new')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'orders'
  }, (payload) => {
    // mostrar toast con payload.new
  })
  .subscribe()
```

---

## Integración WhatsApp

La URL se construye en `src/lib/utils/whatsapp.ts`:

```typescript
// Formato base
`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`

// El mensaje incluye: número de pedido, ítems con cantidades y precios,
// total, tipo de entrega, y datos del cliente
```

El número se lee de `settings.whatsapp_number` (formato sin `+`, ej: `5491100000000`).

---

## Cron job anti-pausa (Supabase Free tier)

Supabase pausa proyectos inactivos por 7 días. El cron job en Vercel hace ping cada 3 días.

```json
// vercel.json
{
  "crons": [{
    "path": "/api/healthcheck",
    "schedule": "0 12 */3 * *"
  }]
}
```

---

## Storage de imágenes

- Bucket: `product-images` (público)
- Imágenes comprimidas client-side con `browser-image-compression` antes de subir (~200-300 KB máximo)
- Supabase Storage tiene transformaciones on-the-fly habilitadas (resize por URL)
- Límite free tier: 1 GB (~3.000 fotos optimizadas)

---

## Funcionalidades MVP (prioridad alta)

### Módulo Admin
- [x] Login / logout con Supabase Auth
- [ ] Dashboard con StatsCards (pedidos pendientes, stock bajo, ventas del día)
- [ ] ABM completo de productos (crear, editar, desactivar)
- [ ] Subida de imágenes múltiples con preview y reordenamiento
- [ ] Ajuste manual de stock con motivo
- [ ] Gestión de descuentos por producto
- [ ] Tabla de pedidos con filtros por estado
- [ ] Detalle de pedido con cambio de estado
- [ ] Contacto directo al cliente por WhatsApp desde el panel
- [ ] Notificación en tiempo real de pedidos nuevos (Realtime)
- [ ] Top productos más vendidos
- [ ] Lista de productos con stock bajo

### Módulo Catálogo
- [ ] Catálogo ISR con grid de productos
- [ ] Filtrado por categoría
- [ ] Búsqueda por texto (full-text Postgres)
- [ ] Página de detalle de producto
- [ ] Carrito de compras (Zustand, persiste en sessionStorage)
- [ ] Checkout con formulario de datos del cliente
- [ ] Envío del pedido vía WhatsApp + registro en DB

---

## Funcionalidades v2 (segunda iteración)

- Integración MercadoPago Checkout Pro
- Historial de movimientos de stock
- Gráfico de ventas por período
- Historial de cambios de precio por producto
- Ingreso de mercadería via foto de factura + IA
- Escaneo de código de barras para ingreso de stock
- Importación de productos via CSV
- Roles adicionales (operador)
- Políticas RLS estrictas para producción

---

## Decisiones técnicas relevantes

**¿Por qué ISR y no SSR para el catálogo?**
El catálogo es contenido relativamente estático. ISR con `revalidate: 30` permite servirlo desde el CDN de Vercel (muy rápido) y revalidarlo automáticamente o bajo demanda cuando el admin actualiza un producto. SSR puro consultaría Supabase en cada visita innecesariamente.

**¿Por qué `order_items` tiene snapshot del producto?**
Si el precio de un producto cambia después de que se realizó una compra, el historial de pedidos no debe verse afectado. Los campos `product_name`, `product_sku` y `unit_price` se copian en el momento de la compra.

**¿Por qué `immutable_unaccent()` en lugar de `unaccent()` directo?**
Postgres requiere que las funciones usadas en expresiones de índice sean `IMMUTABLE`. `unaccent()` está declarada como `STABLE` en Postgres. El wrapper `public.immutable_unaccent()` re-expone la misma función como `IMMUTABLE`, lo cual es correcto en la práctica porque los diccionarios de tildes no cambian en runtime. Es el patrón estándar para este caso.

**¿Por qué el stock se libera al acreditar y no al confirmar el pedido?**
Para integración con MercadoPago: el dinero puede quedar en revisión. El stock se descuenta definitivamente solo cuando `payment_status` cambia a `paid` via webhook, evitando descontar stock por pagos que finalmente no se acreditan.

**¿Por qué tres clientes de Supabase distintos?**
- `server.ts`: maneja cookies para mantener la sesión en SSR correctamente
- `client.ts`: necesario para Realtime (requiere WebSocket desde el browser)
- `admin.ts`: usa `service_role` para bypass de RLS en operaciones administrativas — nunca debe llegar al cliente
