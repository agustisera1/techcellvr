# Plan de Desarrollo — TechCell MVP

> Orden secuencial basado en dependencias reales entre módulos.
> Cada feature se trabaja en su propia branch desde `main`.
> Merge a `main` al completar cada feature antes de iniciar la siguiente.

---

## Estado actual

**Implementado:**
- Auth completo (login, signup, reset password, confirm email)
- Layout admin (sidebar, navbar, stock alert banner)
- Dashboard con datos mock
- Componentes shared: DataTable, ConfirmDialog, StatusBadge, EmptyState
- Primitivos shadcn/ui instalados
- Schema SQL definido en `DB.sql` (no migrado)
- Mocks con tipos TypeScript

**Sin implementar:**
- Middleware de proteccion de rutas admin
- Migraciones Supabase
- Tipos generados de DB
- Capa de servicios
- Server Actions
- Route Handlers
- Validaciones Zod
- Modulos admin (products, orders, stock, reports, settings)
- Catalogo publico
- Carrito y checkout
- Realtime

---

## Fase 1 — Fundaciones

### 1. `feature/database-setup`

Crear la infraestructura de base de datos que todo lo demas necesita.

| Tarea | Detalle |
|-------|---------|
| Migraciones SQL | Crear archivos en `supabase/migrations/` a partir de `DB.sql` |
| Seed data | Script de datos iniciales (categorias base, settings, usuario admin) |
| Tipos generados | `npx supabase gen types typescript` → `src/lib/database.types.ts` |
| Admin client | Crear `src/lib/supabase/admin.ts` con `createAdminClient()` |
| Validaciones base | `src/lib/validations/products.ts`, `orders.ts`, `customers.ts` |
| ActionResult type | `src/lib/types/actions.ts` con el tipo estandar de retorno |
| Utilidades pendientes | `src/lib/utils/slug.ts`, `src/lib/utils/whatsapp.ts` |

**Criterio de completitud:** `supabase db push` exitoso, tipos generados sin errores, seed ejecutado.

---

### 2. `feature/auth-middleware`

Proteger las rutas admin y establecer el patron de error boundaries.

| Tarea | Detalle |
|-------|---------|
| `middleware.ts` | Proteger `/admin/*` — redirigir a `/auth/login` si no hay sesion |
| `getAuthenticatedUser()` | Helper en `src/lib/supabase/get-user.ts` con `React.cache()` |
| Error boundaries | `error.tsx` en `/admin` y `/admin/[modulo]` |
| Loading states | `loading.tsx` base para rutas admin |

**Criterio de completitud:** Acceder a `/admin` sin sesion redirige a login. Con sesion, renderiza normalmente. Errores de fetch muestran `error.tsx`.

---

## Fase 2 — Admin Core

### 3. `feature/admin-categories`

Las categorias son FK de productos — necesitan existir primero.

| Tarea | Detalle |
|-------|---------|
| Servicio | `src/lib/categories-service.ts` — `getCategories()`, `createCategory()`, `updateCategory()`, `deleteCategory()` |
| Server Actions | `src/app/admin/categories/actions.ts` |
| Pagina + tabla | `src/app/admin/categories/page.tsx` con DataTable |
| Formulario | Drawer (Sheet) para crear/editar categoria |
| Validacion Zod | `src/lib/validations/categories.ts` |
| Jerarquia | Soporte para `parent_id` (categorias padre/hijo) |

**Criterio de completitud:** CRUD completo de categorias funcionando con datos reales de Supabase.

---

### 4. `feature/admin-products`

El modulo central del negocio. Depende de categorias.

| Tarea | Detalle |
|-------|---------|
| Servicio | `src/lib/products-service.ts` — `getProducts()`, `getProduct()`, `createProduct()`, `updateProduct()`, `toggleProductActive()` |
| Server Actions | `src/app/admin/products/actions.ts` |
| Pagina + tabla | `ProductsTable` con filtros por categoria, estado activo, stock bajo |
| Formulario | Drawer para crear/editar producto (nombre, SKU, precio, descripcion, categoria, stock inicial) |
| ImageUploader | Componente de subida con compresion a ~200-300 KB → Supabase Storage `product-images` |
| Descuentos | `DiscountForm` dentro del detalle del producto |
| Slug | Auto-generacion desde nombre via `slug.ts` |
| Price history | Registro automatico en `price_history` cuando cambia el precio |

**Criterio de completitud:** ABM completo de productos con imagenes, descuentos, y historial de precios.

---

### 5. `feature/admin-stock`

Gestion de inventario. Depende de productos.

| Tarea | Detalle |
|-------|---------|
| Servicio | `src/lib/stock-service.ts` — `getStockMovements()`, `adjustStock()`, `getProductStock()` |
| Server Actions | `src/app/admin/stock/actions.ts` |
| Pagina + tabla | `StockMovementsTable` con filtros por producto, tipo de movimiento, fecha |
| Formulario | `StockAdjustForm` — ajuste manual con razon obligatoria |
| Alerta de stock bajo | Conectar `StockAlertBanner` a datos reales (query `stock <= stock_min_threshold`) |
| Audit trail | Cada movimiento registra `stock_before`, `stock_after`, `type`, `reason` |

**Criterio de completitud:** Ajustes de stock con trazabilidad completa. Banner de stock bajo funcional con datos reales.

---

## Fase 3 — Pedidos

### 6. `feature/admin-orders`

Gestion de pedidos. Depende de productos y clientes.

| Tarea | Detalle |
|-------|---------|
| Servicio | `src/lib/orders-service.ts` — `getOrders()`, `getOrder()`, `updateOrderStatus()` |
| Servicio clientes | `src/lib/customers-service.ts` — `getCustomer()`, `upsertCustomer()` |
| Server Actions | `src/app/admin/orders/actions.ts` |
| Pagina + tabla | `OrdersTable` con filtros por estado, fecha, metodo de pago |
| Detalle drawer | `OrderDetailDrawer` — items, cliente, timeline de estados |
| Status updates | `OrderStatusUpdater` — transiciones de estado con validacion |
| StatusBadge | Conectar a estados reales del enum de ordenes |
| WhatsApp | `WhatsAppContactButton` — abre chat con el cliente |

**Criterio de completitud:** Ver, filtrar y gestionar pedidos. Actualizar estados con validacion de transiciones.

---

### 7. `feature/realtime-notifications`

Notificaciones en tiempo real de nuevos pedidos. Depende de orders.

| Tarea | Detalle |
|-------|---------|
| Listener | `OrdersRealtimeListener` en `AdminLayout` — suscribe a INSERT en `orders` |
| Toast | Notificacion sonner al recibir nuevo pedido con link al detalle |
| Sonido | Sonido de notificacion opcional (configurable en settings) |
| Cleanup | Desuscribir canal al desmontar |

**Criterio de completitud:** Al crear un pedido desde el catalogo, el admin recibe toast en tiempo real.

---

## Fase 4 — Catalogo publico

### 8. `feature/catalog-pages`

Paginas publicas del catalogo con ISR. Depende de productos y categorias.

| Tarea | Detalle |
|-------|---------|
| Layout | `src/app/(catalog)/layout.tsx` con `CatalogNavbar` |
| Home | `src/app/(catalog)/page.tsx` — productos destacados + categorias |
| Categoria | `src/app/(catalog)/[category]/page.tsx` — grilla filtrada por categoria |
| Detalle | `src/app/(catalog)/p/[slug]/page.tsx` — ficha de producto |
| Componentes | `ProductGrid`, `ProductCard`, `CategorySidebar`, `BusinessHoursBanner` |
| Busqueda | `ProductSearchBar` — full-text search con indice GIN |
| ISR | `revalidate: 30` en todas las paginas del catalogo |
| SEO | `generateMetadata()` dinamico para productos y categorias |

**Criterio de completitud:** Catalogo navegable por categoria, buscable, con fichas de producto. ISR funcional.

---

### 9. `feature/cart-checkout`

Carrito y flujo de checkout via WhatsApp. Depende del catalogo.

| Tarea | Detalle |
|-------|---------|
| Cart store | `src/lib/store/cart.ts` — Zustand con `sessionStorage` |
| CartDrawer | Sheet lateral con lista de items, cantidades, total |
| CheckoutForm | Formulario de datos del cliente (nombre, telefono, direccion) |
| CheckoutSummary | Resumen del pedido antes de confirmar |
| Route Handler | `POST /api/orders` — crea orden + order_items con snapshot |
| WhatsApp | `WhatsAppOrderButton` — primero POST, luego abre `wa.me` con mensaje formateado |
| Validacion | Schema Zod para datos del cliente y items del carrito |
| Stock check | Verificar disponibilidad antes de crear el pedido |

**Criterio de completitud:** Flujo completo: agregar al carrito → checkout → crear orden en DB → abrir WhatsApp.

---

## Fase 5 — Dashboard, reportes e infraestructura

### 10. `feature/admin-dashboard`

Reemplazar mocks por datos reales. Depende de que productos, orders y stock existan.

| Tarea | Detalle |
|-------|---------|
| KPIs reales | Ventas del dia, pedidos pendientes, productos activos, stock bajo |
| StatsCard | Conectar a queries reales |
| TopProductsTable | Productos mas vendidos (query a order_items) |
| PendingOrdersWidget | Ultimos pedidos pendientes con acceso rapido |
| LowStockTable | Productos bajo umbral minimo |
| Eliminar mocks | Borrar `src/lib/mocks/` al completar la migracion a datos reales |

**Criterio de completitud:** Dashboard 100% funcional con datos de Supabase. Carpeta mocks eliminada.

---

### 11. `feature/admin-reports`

Reportes basicos del negocio. Depende del dashboard.

| Tarea | Detalle |
|-------|---------|
| Ventas por periodo | Tabla con filtro de rango de fechas |
| Productos mas vendidos | Ranking por cantidad y por monto |
| Movimientos de stock | Historial filtrable por producto y tipo |
| Exportar | Boton para descargar como CSV (client-side) |

**Criterio de completitud:** Reportes basicos funcionando con filtros de fecha y exportacion.

---

### 12. `feature/api-infra`

Endpoints de infraestructura y configuracion.

| Tarea | Detalle |
|-------|---------|
| Revalidation | `POST /api/revalidate` protegido con `REVALIDATE_SECRET` — invalida tags ISR |
| Healthcheck | `GET /api/healthcheck` — cron cada 3 dias para evitar pausa de Supabase |
| vercel.json | Configurar cron job para healthcheck |
| Settings page | `src/app/admin/settings/page.tsx` — nombre del negocio, WhatsApp, horarios |
| Settings service | `src/lib/settings-service.ts` — CRUD de key-value pairs |

**Criterio de completitud:** Cron configurado, revalidation funcional, settings editables.

---

## Resumen de branches

| # | Branch | Depende de | Fase |
|---|--------|-----------|------|
| 1 | `feature/database-setup` | — | Fundaciones |
| 2 | `feature/auth-middleware` | #1 | Fundaciones |
| 3 | `feature/admin-categories` | #2 | Admin Core |
| 4 | `feature/admin-products` | #3 | Admin Core |
| 5 | `feature/admin-stock` | #4 | Admin Core |
| 6 | `feature/admin-orders` | #4 | Pedidos |
| 7 | `feature/realtime-notifications` | #6 | Pedidos |
| 8 | `feature/catalog-pages` | #4 | Catalogo |
| 9 | `feature/cart-checkout` | #8 | Catalogo |
| 10 | `feature/admin-dashboard` | #5, #6 | Polish |
| 11 | `feature/admin-reports` | #10 | Polish |
| 12 | `feature/api-infra` | #9 | Polish |

---

## Fuera del MVP (v2)

Estas features se planifican despues del MVP funcional:

- `feature/mercadopago` — integracion de pagos online
- `feature/stock-ai-entry` — ingreso de stock via foto de factura con IA
- `feature/barcode-scanner` — escaneo de codigo de barras
- `feature/csv-import` — importacion masiva de productos
- `feature/roles-permissions` — roles adicionales (viewer, manager)
- `feature/rls-production` — policies RLS estrictas para produccion
- `feature/tanstack-query` — polling y mutaciones optimisticas client-side
