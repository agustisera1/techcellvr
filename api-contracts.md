# API Contracts — TechCell

Contratos de los Route Handlers públicos y de infraestructura. Las mutaciones del admin se realizan via Server Actions (no Route Handlers) y no están documentadas aquí.

> **Envelope estándar:** Todas las respuestas usan `{ data: T }` en éxito y `{ error: string }` en fallo.

---

## `POST /api/orders`

Crea un pedido desde el catálogo público. Punto de entrada del flujo de checkout WhatsApp.

### Autenticación
Ninguna. Endpoint público.

### Request

**Headers**
```
Content-Type: application/json
```

**Body**
```ts
{
  customer: {
    name: string          // requerido, min 2 chars
    phone: string         // requerido, formato argentino: 10-13 dígitos, sin espacios ni guiones
    email?: string        // opcional
  }
  items: Array<{
    product_id: string    // uuid, requerido
    quantity: number      // entero positivo, min 1
  }>                      // al menos 1 ítem requerido
  delivery_type: 'shipping' | 'pickup'
  delivery_address?: string  // requerido si delivery_type === 'shipping', ignorado si 'pickup'
  notes?: string          // observaciones del cliente, max 500 chars
}
```

### Responses

**`201 Created`** — Pedido creado exitosamente.
```ts
{
  data: {
    order_id: string        // uuid del pedido creado
    order_number: string    // número legible, ej: "ORD-0042"
    total: number           // total en ARS (centavos enteros, sin decimales)
    whatsapp_message: string // mensaje pre-armado listo para encodeURIComponent en wa.me
  }
}
```

**`400 Bad Request`** — Input inválido. Retorna el primer error de validación Zod.
```ts
{ error: string }
// Ejemplos:
// "El campo phone es requerido"
// "delivery_address es requerido cuando delivery_type es 'shipping'"
// "items debe contener al menos un producto"
```

**`409 Conflict`** — Stock insuficiente al momento de crear el pedido.
```ts
{
  error: string
  // "Stock insuficiente para el producto: iPhone 15 Case (disponible: 2, solicitado: 5)"
}
```

**`500 Internal Server Error`** — Error inesperado de DB u otro servicio.
```ts
{ error: "Internal server error" }
```

### Notas
- El handler hace `upsert` en `customers` usando `phone` como identificador único.
- `order_items` se inserta con snapshot: `product_name`, `product_sku` y `unit_price` se copian del producto en el momento de la creación. No se leen a posteriori via FK.
- El stock **no** se descuenta en este handler. Se descuenta solo al confirmar el pago (ver ADR-003).
- El pedido se crea con `status: 'pending'` y `payment_method: 'whatsapp'`.
- Supabase Realtime emite un evento INSERT en `orders` al completar — `OrdersRealtimeListener` en el admin lo recibe sin polling.

---

## `POST /api/revalidate`

Invalida el cache ISR del catálogo bajo demanda. Lo llama internamente la Server Action de productos al guardar cambios.

### Autenticación
Bearer token. El valor debe coincidir con la variable de entorno `REVALIDATE_SECRET`.

**Headers**
```
Authorization: Bearer <REVALIDATE_SECRET>
Content-Type: application/json
```

### Request

**Body**
```ts
{
  tag: string    // tag a invalidar. Ej: "products", "catalog"
}
```

Tags disponibles:

| Tag | Qué invalida |
|-----|-------------|
| `"products"` | Todas las páginas del catálogo que usan productos |
| `"catalog"` | Home del catálogo y grillas de categoría |
| `"product-{slug}"` | Página de un producto específico |
| `"settings"` | Páginas que leen configuración del negocio |

### Responses

**`200 OK`**
```ts
{
  data: {
    revalidated: true
    tag: string
  }
}
```

**`401 Unauthorized`** — Token ausente o inválido.
```ts
{ error: "Unauthorized" }
```

**`400 Bad Request`** — Body inválido.
```ts
{ error: "tag is required" }
```

### Notas
- No llamar este endpoint directamente desde el cliente — siempre via Server Action.
- `REVALIDATE_SECRET` debe tener al menos 32 caracteres aleatorios.

---

## `GET /api/healthcheck`

Ping de anti-pausa para Supabase Free tier. Lo invoca el cron job de Vercel cada 3 días.

### Autenticación
Ninguna. Endpoint público.

### Request
Sin body ni parámetros.

### Responses

**`200 OK`**
```ts
{
  data: {
    status: "ok"
    timestamp: string   // ISO 8601, ej: "2025-04-01T12:00:00.000Z"
    db: "reachable"     // confirma que Supabase respondió
  }
}
```

**`503 Service Unavailable`** — Supabase no responde.
```ts
{
  error: "Database unreachable"
  timestamp: string
}
```

### Notas
- El handler hace una query mínima a Supabase (ej: `SELECT 1`) para verificar conectividad real.
- Configuración del cron en `vercel.json`: `"schedule": "0 12 */3 * *"` (12:00 UTC cada 3 días).

---

## `POST /api/webhooks/mp` _(v2 — MercadoPago)_

Recibe notificaciones de pago de MercadoPago. Implementar en `feature/mercadopago`.

### Autenticación
Verificación de firma HMAC-SHA256 via header `x-signature` (spec oficial de MercadoPago).

**Headers**
```
x-signature: ts=<timestamp>,v1=<hmac-sha256>
x-request-id: <uuid>
Content-Type: application/json
```

### Request

**Body** — payload estándar de webhook de MercadoPago
```ts
{
  action: "payment.updated" | "payment.created"
  api_version: string
  data: {
    id: string    // payment_id de MercadoPago
  }
  date_created: string
  id: number
  live_mode: boolean
  type: "payment"
  user_id: string
}
```

### Responses

**`200 OK`** — Webhook recibido y procesado. MercadoPago reintenta si no recibe 200.
```ts
{ data: { received: true } }
```

**`400 Bad Request`** — Payload inválido.
```ts
{ error: string }
```

**`401 Unauthorized`** — Firma HMAC inválida.
```ts
{ error: "Invalid signature" }
```

### Flujo de procesamiento
1. Verificar firma HMAC con `MP_WEBHOOK_SECRET`.
2. Si `action === 'payment.updated'`: consultar la API de MP con el `payment_id` para obtener el estado real.
3. Si `status === 'approved'`: actualizar `payment_status → 'paid'` en `orders` y descontar stock.
4. Si `status === 'cancelled'` o `'refunded'`: actualizar `payment_status` en `orders` accordingly.
5. Retornar `200` siempre que la firma sea válida, incluso si el estado no requiere acción.

### Notas
- MercadoPago reintenta el webhook hasta 3 veces si no recibe 200 en 22 segundos.
- Nunca confiar en el payload del webhook para el estado del pago — siempre re-consultar la API de MP.
- El handler debe ser idempotente: procesar el mismo `payment_id` dos veces no debe generar efectos duplicados.
