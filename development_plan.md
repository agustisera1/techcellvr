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
- Design system "Ember": paleta naranja, Space Grotesk, tokens de color light/dark (`design/theme` ✓)

**Sin implementar:**
- Middleware de proteccion de rutas admin
- Migraciones Supabase y seed de categorias
- Tipos generados de DB
- Capa de servicios
- Server Actions
- Route Handlers
- Validaciones Zod
- Modulos admin (products, orders, stock, reports, settings)
- Catalogo publico
- Carrito y checkout
- Realtime

> **Categorias:** se gestionan via seed inicial (lista a definir). No hay pagina de admin para categorias en el MVP.

---

## Fase 1 — Fundaciones

### 1. `feature/database-setup`

Crear la infraestructura de base de datos que todo lo demas necesita.

| Tarea | Detalle |
|-------|---------|
| Migraciones SQL | Crear archivos en `supabase/migrations/` a partir de `DB.sql` |
| Seed data | Categorias base (lista pendiente), settings iniciales, usuario admin |
| Tipos generados | `npx supabase gen types typescript` → `lib/database.types.ts` |
| Admin client | Crear `lib/supabase/admin.ts` con `createAdminClient()` |
| Validaciones base | `lib/validations/products.ts`, `orders.ts`, `customers.ts` |
| ActionResult type | `lib/types/actions.ts` con el tipo estandar de retorno |
| Utilidades pendientes | `lib/utils/slug.ts`, `lib/utils/whatsapp.ts` |

**Criterio de completitud:** `supabase db push` exitoso, tipos generados sin errores, seed ejecutado con categorias reales.

---

### 2. `feature/auth-middleware`

Proteger las rutas admin y establecer el patron de error boundaries.

| Tarea | Detalle |
|-------|---------|
| `middleware.ts` | Proteger `/admin/*` — redirigir a `/auth/login` si no hay sesion |
| `getAuthenticatedUser()` | Helper en `lib/supabase/get-user.ts` con `React.cache()` |
| Error boundaries | `error.tsx` en `/admin` y `/admin/[modulo]` |
| Loading states | `loading.tsx` base para rutas admin |

**Criterio de completitud:** Acceder a `/admin` sin sesion redirige a login. Con sesion, renderiza normalmente. Errores de fetch muestran `error.tsx`.

---

## Fase 2 — Admin Core

### 3. `feature/admin-products`

El modulo central del negocio. Depende de #2.

| Tarea | Detalle |
|-------|---------|
| Servicio | `lib/products-service.ts` — `getProducts()`, `getProduct()`, `createProduct()`, `updateProduct()`, `toggleProductActive()` |
| Server Actions | `app/admin/products/actions.ts` |
| Pagina + tabla | `ProductsTable` con filtros por categoria, estado activo, stock bajo |
| Formulario | `ProductForm` — nombre, slug (auto-generado), descripcion, categoria, precio, `compare_at_price`, stock inicial, umbral minimo, activo, destacado |
| ImageUploader | Subida con compresion a ~200-300 KB → Supabase Storage `product-images` |
| Descuentos | `DiscountForm` — porcentaje, motivo, fechas de vigencia opcionales |
| Slug | Auto-generacion desde nombre via `lib/utils/slug.ts` |
| Price history | Registro automatico en `price_history` via trigger al cambiar precio |

**Criterio de completitud:** ABM completo de productos con imagenes y descuentos.

---

### 4. `feature/admin-stock`

Gestion de inventario. Depende de #3.

| Tarea | Detalle |
|-------|---------|
| Servicio | `lib/stock-service.ts` — `getStockMovements()`, `adjustStock()`, `getProductStock()` |
| Server Actions | `app/admin/stock/actions.ts` |
| Pagina + tabla | `StockMovementsTable` con filtros por producto, tipo de movimiento, fecha |
| Formulario | `StockAdjustForm` — ajuste manual con razon obligatoria, registra en `stock_movements` con tipo `adjustment` |
| Alerta de stock bajo | Conectar `StockAlertBanner` a datos reales (query `stock <= stock_min_threshold`) |
| Audit trail | Cada movimiento registra `stock_before`, `stock_after`, `type`, `reason` |

**Criterio de completitud:** Ajustes de stock con trazabilidad completa. Banner de stock bajo funcional con datos reales.

---

## Fase 3 — Pedidos

### 5. `feature/admin-orders`

Gestion de pedidos. Depende de #3.

| Tarea | Detalle |
|-------|---------|
| Servicio | `lib/orders-service.ts` — `getOrders()`, `getOrder()`, `updateOrderStatus()` |
| Servicio clientes | `lib/customers-service.ts` — `getCustomer()`, `upsertCustomer()` |
| Server Actions | `app/admin/orders/actions.ts` |
| Pagina + tabla | `OrdersTable` con filtros por estado, fecha, metodo de pago |
| Detalle drawer | `OrderDetailDrawer` — items con snapshot, datos del cliente, historial de estados |
| Status updates | `OrderStatusUpdater` — transiciones de estado con validacion |
| WhatsApp | `WhatsAppContactButton` — abre chat con mensaje pre-armado con resumen del pedido |

**Criterio de completitud:** Ver, filtrar y gestionar pedidos. Actualizar estados con validacion de transiciones.

---

### 6. `feature/realtime-notifications`

Notificaciones en tiempo real de nuevos pedidos. Depende de #5.

| Tarea | Detalle |
|-------|---------|
| Listener | `OrdersRealtimeListener` en `AdminLayout` — suscribe a INSERT en `orders` |
| Toast | Notificacion sonner al recibir nuevo pedido con link al detalle |
| Cleanup | Desuscribir canal al desmontar el componente |

**Criterio de completitud:** Al crear un pedido desde el catalogo, el admin recibe toast en tiempo real sin refrescar.

---

## Fase 4 — Catalogo publico

### 7. `feature/catalog-pages`

Paginas publicas del catalogo con ISR. Depende de #3.

| Tarea | Detalle |
|-------|---------|
| Layout | `app/(catalog)/layout.tsx` con `CatalogNavbar` |
| Home | `app/(catalog)/page.tsx` — productos destacados + categorias |
| Categoria | `app/(catalog)/[category]/page.tsx` — grilla filtrada por categoria |
| Detalle | `app/(catalog)/p/[slug]/page.tsx` — ficha de producto |
| Componentes | `ProductGrid`, `ProductCard`, `CategorySidebar`, `BusinessHoursBanner` |
| Busqueda | `ProductSearchBar` — full-text search con debounce via fetch nativo (sin TanStack Query) |
| ISR | `revalidate: 30` en todas las paginas del catalogo |
| SEO | `generateMetadata()` dinamico para productos y categorias |

**Criterio de completitud:** Catalogo navegable por categoria, buscable, con fichas de producto. ISR funcional.

---

### 8. `feature/cart-checkout`

Carrito y flujo de checkout via WhatsApp. Depende de #7.

| Tarea | Detalle |
|-------|---------|
| Cart store | `lib/store/cart.ts` — Zustand con `sessionStorage` |
| CartDrawer | Sheet lateral con lista de items, cantidades editables, subtotales |
| CheckoutForm | Datos del cliente: nombre, telefono, email (opcional), tipo de entrega (envio/retiro), direccion (si aplica). Validado con Zod. |
| CheckoutSummary | Resumen de items, subtotal, costo de envio y total. Se recalcula al cambiar tipo de entrega. |
| Route Handler | `POST /api/orders` — crea orden + order_items con snapshot de producto |
| WhatsApp | `WhatsAppOrderButton` — primero POST a `/api/orders`, si exitoso abre `wa.me`. Nunca al reves. |
| Stock check | Verificar disponibilidad antes de crear el pedido |

**Criterio de completitud:** Flujo completo: agregar al carrito → checkout → orden en DB → abrir WhatsApp.

---

## Fase 5 — Dashboard, reportes e infraestructura

### 9. `feature/admin-dashboard`

Reemplazar mocks por datos reales. Depende de #4 y #5.

| Tarea | Detalle |
|-------|---------|
| KPIs reales | Ventas del dia, pedidos pendientes, productos activos, stock bajo |
| StatsCard | Conectar a queries reales de Supabase |
| TopProductsTable | Productos mas vendidos (query a `order_items` agrupado por `product_id`) |
| PendingOrdersWidget | Ultimos pedidos pendientes con acceso rapido al drawer |
| LowStockTable | Productos bajo umbral minimo con acceso directo a ajuste |
| Eliminar mocks | Borrar `lib/mocks/` al completar la migracion a datos reales |

**Criterio de completitud:** Dashboard 100% funcional con datos de Supabase. Carpeta `lib/mocks/` eliminada.

---

### 10. `feature/admin-reports`

Reportes basicos del negocio. Depende de #9.

| Tarea | Detalle |
|-------|---------|
| Ventas por periodo | Tabla con filtro de rango de fechas |
| Productos mas vendidos | Ranking por cantidad y por monto |
| Exportar | Boton para descargar como CSV (client-side) |

**Criterio de completitud:** Reportes basicos funcionando con filtros de fecha y exportacion CSV.

---

### 11. `feature/api-infra`

Endpoints de infraestructura y configuracion. Depende de #8.

| Tarea | Detalle |
|-------|---------|
| Revalidation | `POST /api/revalidate` protegido con `REVALIDATE_SECRET` — invalida tags ISR bajo demanda |
| Healthcheck | `GET /api/healthcheck` — cron cada 3 dias para evitar pausa de Supabase free tier |
| vercel.json | Configurar cron job para healthcheck (`0 12 */3 * *`) |
| Settings page | `app/admin/settings/page.tsx` — nombre del negocio, WhatsApp, horarios de atencion |
| Settings service | `lib/settings-service.ts` — CRUD de key-value pairs sobre tabla `settings` |

**Criterio de completitud:** Cron configurado en Vercel, revalidation funcional, settings editables desde el panel.

---

## Resumen de branches

| # | Branch | Depende de | Fase |
|---|--------|-----------|------|
| ✓ | `design/theme` | — | Completado |
| 1 | `feature/database-setup` | — | Fundaciones |
| 2 | `feature/auth-middleware` | #1 | Fundaciones |
| 3 | `feature/admin-products` | #2 | Admin Core |
| 4 | `feature/admin-stock` | #3 | Admin Core |
| 5 | `feature/admin-orders` | #3 | Pedidos |
| 6 | `feature/realtime-notifications` | #5 | Pedidos |
| 7 | `feature/catalog-pages` | #3 | Catalogo |
| 8 | `feature/cart-checkout` | #7 | Catalogo |
| 9 | `feature/admin-dashboard` | #4, #5 | Polish |
| 10 | `feature/admin-reports` | #9 | Polish |
| 11 | `feature/api-infra` | #8 | Polish |

---

## Fuera del MVP (v2)

- `feature/mercadopago` — integracion de pagos online
- `feature/stock-ai-entry` — ingreso de stock via foto de factura con IA
- `feature/barcode-scanner` — escaneo de codigo de barras
- `feature/csv-import` — importacion masiva de productos
- `feature/admin-categories` — pagina de gestion de categorias en el admin
- `feature/roles-permissions` — roles adicionales (viewer, manager)
- `feature/rls-production` — policies RLS estrictas para produccion
- `feature/tanstack-query` — polling y mutaciones optimisticas client-side
- `feature/stock-movements-log` — historial completo de movimientos con filtros avanzados
