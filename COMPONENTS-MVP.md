# Stock Manager MVP — checklist de componentes

Referencia: `Componentes MVP — Stock Manager.pdf`. Estado inicial: **mocks** en `lib/mocks/`, sin servicios.

## Leyenda

- [ ] Pendiente · [x] Hecho (mock) · (v2) segunda iteración

---

### Shared (`components/shared/`)

| Componente | Notas |
|------------|--------|
| [x] `DataTable` | TanStack Table: orden + paginación cliente |
| [x] `ConfirmDialog` | shadcn Dialog |
| [x] `OrderStatusBadge` / `PaymentStatusBadge` | Colores por estado |
| [ ] `ImageUploader` | Drag & drop, preview (Storage después) |
| [x] `EmptyState` | Placeholder listas/tablas vacías |

### UI base (`components/ui/`)

shadcn: Button, Input, Label, Select, Textarea, Badge, Separator, Skeleton, Tooltip, Dialog, Sheet, Popover, DropdownMenu, Card, Table, Sonner (+ Checkbox existente).

### Admin — layout (`components/admin/layout/`)

| Componente | Notas |
|------------|--------|
| [x] `AdminSidebar` | Navegación + Sheet móvil |
| [x] `AdminNavbar` | Negocio + breadcrumb + menú usuario (logout opcional) |
| [x] `AdminLayout` | Composición + mocks |
| [x] `StockAlertBanner` | `getLowStockProducts()` |

### Admin — productos (`components/admin/products/`)

| Componente | Notas |
|------------|--------|
| [ ] `ProductsTable` | Columnas según PDF |
| [ ] `ProductForm` | Alta/edición |
| [ ] `ProductFilters` | |
| [ ] `DiscountForm` | |
| [ ] `PriceHistoryDrawer` | (v2) |
| [ ] `StockAdjustForm` | |

### Admin — pedidos (`components/admin/orders/`)

| Componente | Notas |
|------------|--------|
| [ ] `OrdersTable` | |
| [ ] `OrderDetailDrawer` | |
| [ ] `OrderStatusUpdater` | |
| [ ] `WhatsAppContactButton` | |
| [ ] `OrdersRealtimeListener` | Toast + Realtime después |
| [ ] `OrderFilters` | |

### Admin — dashboard (`components/admin/dashboard/`)

| Componente | Notas |
|------------|--------|
| [x] `StatsCard` | |
| [x] `DashboardOverview` | Demo con mocks |
| [ ] `TopProductsTable` | |
| [ ] `PendingOrdersWidget` | |
| [ ] `SalesChart` | (v2) Recharts |
| [ ] `LowStockTable` | |
| [ ] `StockMovementsLog` | (v2) |

### Catálogo público (`components/catalog/`)

| Componente | Notas |
|------------|--------|
| [ ] `CatalogNavbar` | |
| [ ] `CategorySidebar` | |
| [ ] `ProductGrid` | |
| [ ] `ProductCard` | |
| [ ] `ProductSearchBar` | |
| [ ] `CartDrawer` | Zustand |
| [ ] `CheckoutForm` | Zod |
| [ ] `CheckoutSummary` | |
| [ ] `WhatsAppOrderButton` | |
| [ ] `BusinessHoursBanner` | `settings` |

---

## Rutas actuales

- `/admin` — dashboard demo
- `/admin/products`, `/orders`, `/stock`, `/reports`, `/settings` — placeholders

## Dependencias añadidas

`@tanstack/react-table`, `@tanstack/react-query`, `zustand`, `zod`, `react-hook-form`, `@hookform/resolvers`, shadcn: select, textarea, separator, skeleton, tooltip, dialog, sheet, popover, table, sonner.

---

_Orden sugerido para siguientes entregas: `ProductsTable` + mocks → `OrdersTable` → formularios (`ProductForm`, `CheckoutForm`) → catálogo público._
