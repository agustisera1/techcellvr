# CLAUDE.md

## Archivos de contexto obligatorio

Leer siempre antes de cualquier tarea. Son la fuente de verdad del proyecto:

| Archivo | Cuándo leer | Contenido |
|---------|-------------|-----------|
| `ANEXO_CTX.md` | Features nuevas, cambios de schema, flujos de negocio | Modelo de datos, arquitectura de módulos, diagramas de flujo |
| `COMPONENTS-MVP.md` | Cualquier trabajo sobre componentes | Inventario de componentes, estado de implementación, responsabilidades |
| `development_plan.md` | Al iniciar o retomar una feature | Roadmap secuencial, dependencias entre features, criterios de completitud |
| `decisions.md` | Cuando una decisión técnica no sea obvia | ADRs: por qué se eligió cada enfoque y sus consecuencias |
| `api-contracts.md` | Al implementar Route Handlers o el checkout | Contratos de request/response de cada endpoint |

## Stack

Next.js 14 App Router · TypeScript · Supabase · Tailwind · shadcn/ui · TanStack Table v8 · Zustand · Zod

## Reglas absolutas

- **Nunca** importar `lib/supabase/admin.ts` en Client Components. Solo en Server Actions y Route Handlers.
- **Nunca** usar `SUPABASE_SERVICE_ROLE_KEY` con prefijo `NEXT_PUBLIC_`.
- **Nunca** modificar archivos en `components/ui/` directamente — son primitivos de shadcn.
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
- Server Actions en `app/admin/*/actions.ts` — nunca en Route Handlers para mutaciones del admin.
- Validar inputs con Zod antes de cualquier operación en DB. Schemas en `lib/validations/`.
- Tipos de DB generados automáticamente en `lib/database.types.ts`. Regenerar con:
  ```bash
  npx supabase gen types typescript --project-id <id> > lib/database.types.ts
  ```
- Slugs generados desde el nombre del producto via `lib/utils/slug.ts`.
- Links de WhatsApp construidos via `lib/utils/whatsapp.ts`.
- Formatters de precio y fecha en `lib/utils/format.ts`. Moneda: ARS.
- Imports siempre con alias `@/*`. Nunca rutas relativas que suban más de un nivel (`../../`).

### TypeScript clean code

- **Preferir `unknown` sobre `any`**. Si `any` es inevitable, dejar un comentario `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- <razón>`.
- **Nunca usar `as` para castear** salvo en boundaries con datos externos (respuestas de APIs, JSON parseado). Preferir narrowing con type guards.
- **`satisfies` sobre `as`** cuando se quiere validar un tipo sin perder la inferencia: `const config = { ... } satisfies Config`.
- **Discriminated unions sobre booleanos** para estados compuestos: `type Status = 'idle' | 'loading' | 'error' | 'success'` en vez de `isLoading` + `isError`.
- **Evitar `enum`** — usar union types (`type Role = 'admin' | 'viewer'`) o `as const` objects para mejor tree-shaking.
- **`const` assertions** para objetos de configuración inmutables: `as const`.
- **`Readonly<T>`** en DTOs de servicios — son snapshots de datos, no objetos mutables.

### Naming

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Componentes | PascalCase `.tsx` | `ProductsTable.tsx` |
| Server Actions | kebab-case `actions.ts` | `app/admin/products/actions.ts` |
| Servicios | kebab-case `-service.ts` | `products-service.ts` |
| Stores Zustand | kebab-case `-store.ts` | `cart-store.ts` |
| Tipos/validaciones | kebab-case `.ts` | `products.ts` |
| Utilidades | kebab-case `.ts` | `format.ts`, `slug.ts` |

### Co-ubicación de componentes

- Componentes usados solo por una ruta → `app/admin/<dominio>/_components/NombreComponente.tsx`. No importar desde fuera.
- Componentes compartidos entre múltiples rutas → `components/shared/`.

### Server Components — patrones

Usar `Promise.all()` para fetches independientes en paralelo. Nunca encadenar `await`s secuenciales para datos no relacionados.

```tsx
// Bien — fetches en paralelo
const [products, categories] = await Promise.all([
  getProducts(),
  getCategories(),
])

// Mal — secuencial, innecesariamente lento
const products = await getProducts()
const categories = await getCategories()
```

En Next.js 14 las páginas pueden ser `async` sin problema. Usar `<Suspense>` cuando se quiere streaming granular (mostrar partes de la página antes de que todo termine de cargar):

```tsx
// Página con Suspense para streaming — recomendado cuando hay fetches lentos
export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsTableSkeleton />}>
      <ProductsContent />
    </Suspense>
  )
}

async function ProductsContent() {
  const products = await getProducts()
  return <ProductsTable products={products} />
}
```

Acompañar cada `<Suspense>` con un `error.tsx` en la misma ruta para capturar errores del fetch y mostrar feedback al usuario en vez de romper la página entera.

### Servicios (`lib/`)

- Una función exportada por operación: `getProducts()`, `createProduct()`, etc.
- **Nunca usar `.select('*')`** — listar explícitamente las columnas necesarias.
- Siempre crear un nuevo cliente Supabase dentro de la función, nunca reutilizar uno a nivel de módulo.
- Destructurar `{ data, error }` de cada llamada Supabase. Si `error` es truthy, lanzar `new Error(error.message)`.
- Para fetches de un único ítem usar `.maybeSingle()` (retorna `null` sin error cuando no hay fila) y retornar `T | null`. Dejar que el caller decida si hace 404. **No usar `.single()`** que lanza error `PGRST116` cuando no encuentra filas.
- Definir y exportar el DTO como `Readonly<T>` junto a la función del servicio.
- RLS retorna resultados vacíos (sin error) cuando no autorizado — no asumir que vacío = no existe.

```ts
export type ProductDetail = Readonly<{
  id: string
  name: string
  sku: string
  stock: number
}>

export async function getProduct(id: string): Promise<ProductDetail | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('id, name, sku, stock')   // columnas explícitas
    .eq('id', id)
    .maybeSingle()                    // null sin error si no existe
  if (error) throw new Error(error.message)
  return data
}
```

### Manejo de errores por capa

| Capa | Qué hace con errores |
|------|---------------------|
| Servicios (`lib/`) | Lanzan `Error` — nunca atrapan |
| Server Actions | Atrapan errores de servicios, retornan `ActionResult` |
| Route Handlers | Atrapan errores de servicios, retornan `{ error }` con HTTP status |
| Server Components | Dejan que los errores propaguen al `error.tsx` más cercano |
| Client Components | Manejan `ActionResult` y muestran feedback al usuario |

### Server Actions — tipo de retorno estándar

Todas las Server Actions retornan `ActionResult<T>`. Definido en `lib/types/actions.ts`:

```ts
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
```

Esto unifica el manejo de errores en formularios y evita `try/catch` disperso en cada componente. El Client Component evalúa `result.success` para decidir si muestra feedback positivo o negativo.

### Route Handlers

- Validar todo input con Zod antes de llamar cualquier servicio — los Route Handlers son el boundary del sistema.
- Retornar envelope JSON consistente: `{ data: T }` en éxito, `{ error: string }` en fallo.
- Códigos HTTP correctos: `400` input inválido, `401` no autenticado, `403` no autorizado, `404` no encontrado, `500` error inesperado.
- Delegar toda lógica de negocio a servicios en `lib/` — los handlers solo coordinan.

## Componentes

- `DataTable` en `components/shared/DataTable.tsx` es el wrapper genérico de TanStack Table. Usarlo como base para todas las tablas del admin.
- `StatusBadge` mapea estados de orders/payments a colores semánticos.
- `ImageUploader` comprime imágenes a ~200-300 KB antes de subir a Supabase Storage bucket `product-images`.
- `OrdersRealtimeListener` se monta en `AdminLayout` — suscribe a INSERT en `orders` y dispara toast.

### Patrón de tablas (TanStack Table)

Estructura: contenedor de altura fija (`h-[400px]`, `flex flex-col`), header sticky (`sticky top-0 z-10 bg-card`), body scrollable (`flex-1 overflow-auto min-h-0`), paginación fija al fondo (`flex-shrink-0`).

- Resetear a página 0 en cada cambio de filtro o búsqueda: `table.setPageIndex(0)`.
- Page size por defecto: `15`. Definirlo como constante `const PAGE_SIZE = 15`.
- Dos mensajes de empty state: uno cuando no hay datos (`rows.length === 0`), otro cuando los filtros no retornan resultados.
- Columnas de acciones usan `e.stopPropagation()` si la fila tiene `onClick` de navegación.
- Filtros Select con `w-auto min-w-[120px]` en `SelectTrigger` para evitar el `w-full` default de shadcn.

### Patrón de drawers (Sheet)

Estructura: `SheetContent` con `sm:max-w-xl`, header fijo (`SheetHeader`), body scrollable (div con `flex-1 overflow-y-auto px-6 py-4`), footer fijo (`SheetFooter`).

- `overflow-y-auto` solo en el div interno, nunca en `SheetContent`.
- El `<form>` lleva `id` (ej. `id="product-form"`) y el botón de submit externo usa `form="product-form"`.
- Cancelar siempre con `<SheetClose asChild>` para respetar la animación de Radix.

## Búsqueda full-text

```sql
-- Query de búsqueda de productos (usa índice GIN existente)
select id, name, slug, description, price, stock, image_url
from products
where to_tsvector('spanish',
    public.immutable_unaccent(coalesce(name,'')) || ' ' ||
    public.immutable_unaccent(coalesce(description,'')))
  @@ plainto_tsquery('spanish', public.immutable_unaccent($1))
  and active = true;
```

## Estado global (Zustand)

Zustand store del carrito en `lib/store/cart.ts`. Persiste en `sessionStorage` (no localStorage — se limpia al cerrar el tab, comportamiento esperado para un e-commerce).

Reglas para todos los stores:
- Un store por dominio funcional. Evitar stores monolíticos.
- El store guarda estado de UI, no caché de datos del servidor.
- Las mutaciones se realizan a través de acciones definidas dentro del store, no directamente desde componentes.
- Tipado estricto: definir interfaces para el estado de cada store.

## Estrategia de caché

| Mecanismo | Dónde | Efecto |
|-----------|-------|--------|
| ISR `revalidate: 30` | Rutas del catálogo | Catálogo público se regenera cada 30s |
| `revalidateTag(tag)` | Server Actions | Invalidación por tag en mutaciones del admin |
| `React.cache()` | `getAuthenticatedUser()` | Deduplica la verificación de sesión a 1 llamada por request |
| `unstable_cache` | Datos de referencia estáticos | Caché indefinido en servidor para datos que no cambian |

**Restricción:** El cliente Supabase SSR usa `cookies()` y es incompatible con `unstable_cache`. Para caché persistente de datos de usuario se requiere `service_role`.

## RLS actual

Development: policies `dev: full access` en todas las tablas (`using (true)`). Reemplazar por policies estrictas antes de producción. Ver `ANEXO_CTX.md` para el detalle de policies de producción.

## Migraciones

Versionadas en `supabase/migrations/`. Al cambiar el schema:
1. Crear archivo `NNNN_descripcion.sql` en `supabase/migrations/`
2. Correr `supabase db push`
3. Regenerar tipos TypeScript

## Variables de entorno necesarias

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_WHATSAPP_NUMBER
SUPABASE_SERVICE_ROLE_KEY
REVALIDATE_SECRET
```

## MVP vs v2

**MVP activo:** Auth admin, ABM productos, gestión de pedidos, catálogo ISR, carrito, checkout WhatsApp, Realtime, reportes básicos.

**v2:** MercadoPago, ingreso de stock via IA (foto de factura), escaneo de código de barras, importación CSV, roles adicionales, RLS estricto, TanStack Query (para datos con polling o mutaciones optimísticas client-side).
