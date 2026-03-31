# Decisiones de Arquitectura — TechCell

Registro de decisiones técnicas no obvias. Cada ADR documenta el contexto que llevó a la decisión, la decisión en sí y las consecuencias prácticas para el desarrollo.

> Este archivo reemplaza la sección "Decisiones técnicas relevantes" de `ANEXO_CTX.md`.

---

## ADR-001 · ISR con `revalidate: 30` para el catálogo público

**Contexto:** El catálogo es contenido relativamente estático. Cambia cuando el admin actualiza productos, no en cada visita del usuario final.

**Decisión:** Usar ISR (`revalidate: 30`) en todas las rutas del catálogo, con revalidación bajo demanda via `revalidateTag()` al guardar un producto desde el admin.

**Consecuencias:**
- El catálogo se sirve desde el CDN de Vercel — latencia mínima para el usuario final.
- El admin puede forzar actualización inmediata al guardar un producto, sin esperar los 30s.
- `ProductSearchBar` es la única excepción: usa fetch client-side con debounce para no invalidar el cache ISR en cada keystroke.
- No usar `useRouter().refresh()` ni fetch client-side en otras rutas del catálogo.

---

## ADR-002 · Snapshot de producto en `order_items`

**Contexto:** Los precios y nombres de productos pueden cambiar después de que se realizó una compra.

**Decisión:** `order_items` copia `product_name`, `product_sku` y `unit_price` del producto en el momento de la compra. No resuelve estos valores via FK en runtime.

**Consecuencias:**
- El historial de pedidos es inmutable respecto a cambios futuros del producto.
- Si un producto se elimina, los pedidos históricos siguen siendo legibles.
- La Server Action / Route Handler que crea el pedido es responsable de leer y copiar estos valores antes del INSERT.

---

## ADR-003 · El stock se descuenta solo al acreditar el pago

**Contexto:** Con MercadoPago, un pago puede quedar en revisión antes de acreditarse. Descontar stock al confirmar el pedido puede generar stock negativo si el pago finalmente no se acredita.

**Decisión:** El stock se descuenta **únicamente** cuando `payment_status` cambia a `'paid'`. Para pedidos WhatsApp (pago manual), el descuento se hace cuando el admin confirma el pago en el panel. Para MercadoPago (v2), lo gatilla el webhook `/api/webhooks/mp`.

**Consecuencias:**
- No hacer decremento de stock en la Server Action ni Route Handler que crea el pedido.
- Los pedidos WhatsApp quedan con `payment_status: 'pending'` hasta confirmación manual del admin.
- El flujo de MercadoPago debe implementar el webhook antes de activarse en producción.

---

## ADR-004 · Tres clientes de Supabase distintos

**Contexto:** Supabase requiere distintas configuraciones según el contexto: SSR necesita manejo de cookies, Realtime necesita WebSocket desde el browser, y ciertas operaciones admin necesitan bypass de RLS.

**Decisión:** Tres archivos en `lib/supabase/`:
- `server.ts` → `@supabase/ssr`, maneja cookies, para Server Components / Actions / Route Handlers
- `client.ts` → `@supabase/ssr` browser, exclusivamente para Realtime y casos edge client-side
- `admin.ts` → `createClient` con `SUPABASE_SERVICE_ROLE_KEY`, bypass RLS, **solo server-side**

**Consecuencias:**
- `admin.ts` nunca debe importarse en archivos con `'use client'`. Regla absoluta.
- `SUPABASE_SERVICE_ROLE_KEY` nunca con prefijo `NEXT_PUBLIC_`.
- Crear una instancia nueva dentro de cada función; nunca reutilizar una instancia a nivel de módulo.

---

## ADR-005 · `immutable_unaccent()` wrapper para el índice GIN de búsqueda

**Contexto:** Postgres requiere que las funciones usadas en expresiones de índice sean `IMMUTABLE`. La función `unaccent()` nativa está declarada como `STABLE`.

**Decisión:** Crear `public.immutable_unaccent(text)` que re-expone `unaccent()` como `IMMUTABLE`. Es correcto en la práctica porque los diccionarios de tildes no cambian en runtime. Es el patrón estándar para este caso.

**Consecuencias:**
- El índice GIN en `products` usa este wrapper para búsqueda en español con soporte de tildes.
- La query de búsqueda debe usar el mismo wrapper para que Postgres utilice el índice.
- Esta función debe crearse en la migración inicial, antes de crear el índice.

---

## ADR-006 · fetch nativo en lugar de TanStack Query

**Contexto:** TanStack Query agrega ~13 KB al bundle y requiere setup de `QueryClient` provider, hooks y cache invalidation. El patrón de fetching del proyecto es principalmente server-side (Server Components + Server Actions).

**Decisión:** No usar TanStack Query en el MVP. Datos del admin: `async` Server Components con fetch directo a Supabase. Búsqueda del catálogo: fetch nativo con debounce en `ProductSearchBar`.

**Consecuencias:**
- Bundle más liviano para el catálogo público.
- Sin polling ni optimistic updates en el MVP — se recarga la página tras mutaciones.
- TanStack Query queda como mejora v2 para casos que lo justifiquen (polling de órdenes, optimistic updates en carrito).

---

## ADR-007 · `sessionStorage` para el carrito, no `localStorage`

**Contexto:** El carrito necesita persistir entre navegaciones dentro de la misma sesión de compra, pero no indefinidamente entre sesiones.

**Decisión:** El Zustand store del carrito (`lib/store/cart.ts`) usa `sessionStorage` como middleware de persistencia. Se limpia automáticamente al cerrar el tab.

**Consecuencias:**
- Comportamiento esperado para un e-commerce básico: el carrito no "sobrevive" al browser.
- No hay carrito abandonado que persista días después de una visita.
- Abrir el catálogo en un tab nuevo inicia con carrito vacío — aceptado en el MVP.

---

## ADR-008 · POST `/api/orders` antes de abrir `wa.me`

**Contexto:** Si el usuario cierra WhatsApp sin enviar el mensaje, el pedido nunca llega al negocio. Si se registra primero en DB, el admin tiene visibilidad de todos los intentos.

**Decisión:** `WhatsAppOrderButton` siempre hace POST a `/api/orders` primero. Solo si la respuesta es exitosa (201) abre `wa.me`. Nunca al revés.

**Consecuencias:**
- Pueden existir pedidos en DB con `status: 'pending'` que nunca se activaron por WhatsApp. El admin los ignora o cancela manualmente.
- El admin tiene registro de todos los intentos de compra, incluso los incompletos.
- Si el POST falla, el usuario ve un error y WhatsApp no se abre.

---

## ADR-009 · Categorías via seed, sin CRUD admin en el MVP

**Contexto:** Una página de gestión de categorías con árbol de subcategorías es una feature no trivial que bloquearía el desarrollo del módulo de productos.

**Decisión:** Las categorías se cargan via seed SQL en `feature/database-setup`. No hay página de admin para categorías en el MVP. La lista la provee el dueño del negocio antes del seed inicial.

**Consecuencias:**
- Agregar o modificar categorías en el MVP requiere intervención directa en la DB (Supabase dashboard o nuevo seed).
- `feature/admin-categories` se implementa en v2.
- El seed debe contemplar el árbol completo de categorías necesario para el lanzamiento.

---

## ADR-010 · `ActionResult<T>` como tipo de retorno estándar de Server Actions

**Contexto:** Sin un tipo de retorno unificado, cada Server Action maneja errores de manera diferente, dispersando `try/catch` y lógica de feedback en los Client Components.

**Decisión:** Todas las Server Actions retornan `ActionResult<T>` definido en `lib/types/actions.ts`:

```ts
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
```

**Consecuencias:**
- Los Client Components evalúan `result.success` para decidir el feedback al usuario.
- Las Server Actions son las únicas que hacen `try/catch` sobre los servicios.
- Los servicios (`lib/`) lanzan `Error` y nunca lo atrapan — dejan que el error suba.

---

## ADR-011 · `.maybeSingle()` en lugar de `.single()` para queries de ítem único

**Contexto:** `.single()` de Supabase lanza el error `PGRST116` cuando no encuentra filas, lo que complica distinguir "no encontrado" de un error real de la DB.

**Decisión:** Usar `.maybeSingle()` en todas las queries que esperan un único resultado. Retorna `null` sin error cuando no hay filas. Los servicios retornan `T | null`.

**Consecuencias:**
- El caller decide si el `null` implica un 404 o si es un estado válido.
- RLS vacío (sin autorización) también retorna `null` — en el MVP con RLS permisivo esto no es problema. A revisar al implementar RLS estricto en producción.

---

## ADR-012 · Zod solo en boundaries del sistema

**Contexto:** Validar con Zod en cada capa genera duplicación y overhead innecesario para datos internos ya tipados por TypeScript.

**Decisión:** Zod se usa exclusivamente en los boundaries del sistema donde llegan datos externos no tipados:
- **Server Actions**: validar `FormData` / inputs de formularios antes de llamar servicios
- **Route Handlers**: validar el request body antes de cualquier operación
- **NO** en servicios (`lib/`), que reciben datos ya validados y tipados por TypeScript

**Consecuencias:**
- Los schemas Zod viven en `lib/validations/` (products.ts, orders.ts, settings.ts).
- Los servicios confían en los tipos TypeScript — no re-validan con Zod.
- Cualquier input que venga del exterior (usuario, webhook externo) pasa por Zod antes de entrar al sistema.
