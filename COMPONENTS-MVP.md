# Componentes MVP — TechCell Stock Manager

Fuente de verdad de componentes. Referencia original: `Componentes MVP — Stock Manager.pdf`.

## Leyenda

- [ ] Pendiente · [x] Implementado · (v2) segunda iteración
- **Server** = Server Component · **Client** = Client Component

---

## Shared (`components/shared/`)

| Estado | Componente | Responsabilidad | Tipo |
|--------|-----------|----------------|------|
| [x] | `DataTable` | Wrapper genérico sobre TanStack Table. Sorting, paginación y column visibility reutilizable en todas las tablas del admin. | Client |
| [x] | `ConfirmDialog` | Dialog de confirmación genérico para acciones destructivas (eliminar producto, cancelar pedido). | Client |
| [x] | `StatusBadge` | Badge con color semántico según estado: `pending` → amber, `confirmed` → blue, `delivered` → green, `cancelled` → red. | Client |
| [ ] | `ImageUploader` | Drag & drop + preview. Comprime imágenes a ~200-300 KB antes de subir al bucket `product-images` de Supabase Storage. Soporta múltiples imágenes con reordenamiento. | Client |
| [x] | `EmptyState` | Placeholder visual para tablas y listas vacías. Recibe título, descripción y acción opcional. | Client |

## UI base (`components/ui/`)

Primitivos shadcn/ui — **no modificar directamente**.

Button, Input, Label, Select, Textarea, Badge, Separator, Skeleton, Tooltip, Dialog, Sheet, Popover, DropdownMenu, Card, Table, Sonner, Checkbox.

---

## Admin — Layout (`components/admin/layout/`)

| Estado | Componente | Responsabilidad | Tipo |
|--------|-----------|----------------|------|
| [x] | `AdminSidebar` | Sidebar fija con navegación principal: Dashboard, Productos, Pedidos, Stock, Reportes, Configuración. Indicador de ruta activa. Colapsable en mobile via Sheet. | Client |
| [x] | `AdminNavbar` | Topbar con nombre del negocio, breadcrumb de ruta actual y menú de usuario (avatar + logout). | Client |
| [x] | `AdminLayout` | Wrapper de `app/admin/layout.tsx`. Compone Sidebar + Navbar + área de contenido. Verifica sesión activa server-side. | Server |
| [x] | `StockAlertBanner` | Banner en el top del admin cuando hay productos por debajo del umbral mínimo de stock. Enlaza directo a la vista de stock. | Server |

---

## Admin — Productos (`components/admin/products/`)

| Estado | Componente | Responsabilidad | Tipo |
|--------|-----------|----------------|------|
| [ ] | `ProductsTable` | TanStack Table con columnas: imagen, nombre, SKU, categoría, precio, stock (con indicador de alerta), estado activo, acciones. Paginación client-side sobre datos traídos del server. | Client |
| [ ] | `ProductForm` | Formulario de alta/edición en Sheet lateral. Campos: nombre, slug (auto-generado), descripción, categoría, precio, `compare_at_price`, stock inicial, umbral mínimo, activo, destacado. | Client |
| [ ] | `ProductFilters` | Barra de filtros sobre la tabla: búsqueda por nombre/SKU, filtro por categoría, por estado (activo/inactivo), por stock bajo. | Client |
| [ ] | `DiscountForm` | Form inline para agregar/editar descuento a un producto. Campos: porcentaje, motivo, fechas de vigencia opcionales. | Client |
| [ ] | `PriceHistoryDrawer` | Sheet lateral con el historial de cambios de precio de un producto. Tabla simple con fecha, precio anterior y nuevo. Poblado automáticamente por trigger de DB. | Client · (v2) |

---

## Admin — Stock (`components/admin/stock/`)

| Estado | Componente | Responsabilidad | Tipo |
|--------|-----------|----------------|------|
| [ ] | `StockMovementsTable` | TanStack Table con el historial de movimientos de stock. Columnas: fecha, producto, tipo de movimiento, stock anterior, stock nuevo, razón. Filtros por producto, tipo y rango de fechas. | Client |
| [ ] | `StockAdjustForm` | Form en Sheet lateral para ajuste manual de stock. Input numérico (positivo o negativo) + motivo obligatorio. Registra en `stock_movements` con tipo `adjustment` incluyendo `stock_before` y `stock_after` para audit trail completo. | Client |

---

## Admin — Pedidos (`components/admin/orders/`)

| Estado | Componente | Responsabilidad | Tipo |
|--------|-----------|----------------|------|
| [ ] | `OrdersTable` | TanStack Table con columnas: fecha, cliente, ítems (resumen), total, tipo de entrega, estado del pedido, estado del pago, acciones. Filtrable por estado. | Client |
| [ ] | `OrderDetailDrawer` | Sheet lateral con el detalle completo de un pedido: datos del cliente, ítems con precios snapshot, totales, historial de estados y botones de acción. | Client |
| [ ] | `OrderStatusUpdater` | Select inline para cambiar el estado del pedido directamente desde la tabla o el drawer. Dispara Server Action con validación de transiciones permitidas. | Client |
| [ ] | `WhatsAppContactButton` | Botón que construye el link `wa.me` con el teléfono del cliente y un mensaje pre-armado con el resumen del pedido para contacto directo desde el panel. | Client |
| [ ] | `OrdersRealtimeListener` | Componente invisible montado en `AdminLayout`. Suscribe al canal Realtime de Supabase (INSERT en `orders`) y muestra un toast cuando llega un pedido nuevo, sin refrescar la página. | Client |
| [ ] | `OrderFilters` | Filtros por estado de pedido, tipo de entrega, rango de fechas y método de pago. | Client |

---

## Admin — Dashboard (`components/admin/dashboard/`)

| Estado | Componente | Responsabilidad | Tipo |
|--------|-----------|----------------|------|
| [x] | `DashboardOverview` | Page-level component que orquesta todos los widgets del dashboard. Actualmente usa mocks; se reemplaza al conectar servicios reales. | Server |
| [x] | `StatsCard` | Card de métrica reutilizable: pedidos pendientes, total del día, productos con stock bajo. Recibe ícono, valor, descripción y variación opcional. | Server |
| [ ] | `TopProductsTable` | Tabla simple con los productos más vendidos por cantidad. Query sobre `order_items` agrupado por `product_id`. | Server |
| [ ] | `PendingOrdersWidget` | Lista compacta de los últimos pedidos en estado `pending` con acceso rápido al drawer de detalle. | Client |
| [ ] | `LowStockTable` | Tabla de productos cuyo stock está por debajo del umbral mínimo. Acceso directo al `StockAdjustForm`. | Server |
| [ ] | `SalesChart` | Gráfico de ventas por período (semana/mes) con Recharts sobre datos de `orders` agrupados por fecha. | Client · (v2) |
| [ ] | `StockMovementsLog` | Tabla paginada del historial completo de movimientos de stock con filtro por producto y tipo de movimiento. | Client · (v2) |

---

## Catálogo público (`components/catalog/`)

| Estado | Componente | Responsabilidad | Tipo |
|--------|-----------|----------------|------|
| [ ] | `CatalogNavbar` | Header público con nombre/logo del negocio, barra de búsqueda, horarios de atención e ícono del carrito con contador de ítems. | Client |
| [ ] | `CategorySidebar` | Panel lateral (o drawer en mobile) con el árbol de categorías. Filtra el catálogo al seleccionar una categoría. | Client |
| [ ] | `ProductGrid` | Grid responsivo de `ProductCard`s. Recibe los productos como prop desde el Server Component padre (ISR). | Server |
| [ ] | `ProductCard` | Card de producto: imagen principal, nombre, precio con descuento si aplica, badge de stock bajo/agotado y botón agregar al carrito. | Client |
| [ ] | `ProductSearchBar` | Input de búsqueda con debounce. Dispara query client-side a Supabase via fetch nativo (sin TanStack Query) para no invalidar el ISR del catálogo. | Client |
| [ ] | `CartDrawer` | Sheet lateral con los ítems del carrito, cantidades editables, subtotales y botón para ir al checkout. Estado manejado con Zustand (`lib/store/cart.ts`). | Client |
| [ ] | `CheckoutForm` | Formulario de datos del cliente: nombre, teléfono, email opcional, tipo de entrega (envío/retiro), dirección si aplica. Validado con Zod. | Client |
| [ ] | `CheckoutSummary` | Resumen de ítems, subtotal, costo de envío y total. Se recalcula al cambiar el tipo de entrega. | Client |
| [ ] | `WhatsAppOrderButton` | Botón final del checkout. Primero hace POST a `/api/orders` para registrar el pedido en DB; si es exitoso, abre `wa.me` con el resumen pre-armado. Nunca al revés. | Client |
| [ ] | `BusinessHoursBanner` | Banner informativo con los horarios de atención del negocio. Lee el valor de la tabla `settings` vía ISR. | Server |

---

## Rutas implementadas

| Ruta | Estado |
|------|--------|
| `/admin` | Dashboard demo con mocks |
| `/admin/products` | Placeholder |
| `/admin/orders` | Placeholder |
| `/admin/stock` | Placeholder |
| `/admin/reports` | Placeholder |
| `/admin/settings` | Placeholder |

---

## Dependencias instaladas

`@tanstack/react-table` · `zustand` · `zod` · `react-hook-form` · `@hookform/resolvers`

shadcn: select · textarea · separator · skeleton · tooltip · dialog · sheet · popover · table · sonner
