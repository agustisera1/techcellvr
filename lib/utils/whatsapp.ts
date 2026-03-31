import { formatARS } from '@/lib/format'

type OrderMessageParams = {
  orderNumber: string
  customerName: string
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
  }>
  total: number
  deliveryType: 'shipping' | 'pickup'
  deliveryAddress?: string
  notes?: string
}

/**
 * Builds the pre-formatted WhatsApp message for a new order.
 * Used by POST /api/orders — the result is returned as `whatsapp_message`
 * in the response and then encodeURIComponent'd by the client (see ADR-008).
 */
export function buildOrderWhatsAppMessage(params: OrderMessageParams): string {
  const itemLines = params.items.map(
    (item) =>
      `  • ${item.name} x${item.quantity} — ${formatARS(item.unitPrice)}`
  )

  const deliveryLine =
    params.deliveryType === 'shipping'
      ? `Envío a domicilio${params.deliveryAddress ? `: ${params.deliveryAddress}` : ''}`
      : 'Retiro en local'

  const lines = [
    `Hola! Quiero confirmar mi pedido *${params.orderNumber}*`,
    '',
    `*Cliente:* ${params.customerName}`,
    '',
    '*Productos:*',
    ...itemLines,
    '',
    `*Total:* ${formatARS(params.total)}`,
    `*Entrega:* ${deliveryLine}`,
  ]

  if (params.notes) {
    lines.push('', `*Notas:* ${params.notes}`)
  }

  return lines.join('\n')
}

/**
 * Builds the wa.me URL for a given phone number and message.
 * Strips all non-digit characters from the phone number.
 *
 * @param phone - Phone number with country code (e.g. '5491112345678')
 * @param message - Raw message text (will be encodeURIComponent'd here)
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '')
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}
