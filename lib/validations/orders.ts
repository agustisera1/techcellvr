import { z } from 'zod'

// Argentine phone: 10–13 digits, no spaces or dashes (see api-contracts.md)
const phoneRegex = /^\d{10,13}$/

const orderItemSchema = z.object({
  product_id: z.string().uuid({ message: 'product_id debe ser un UUID válido' }),
  quantity: z
    .number({ invalid_type_error: 'quantity debe ser un número' })
    .int('quantity debe ser un entero')
    .min(1, 'quantity debe ser al menos 1'),
})

export const createOrderSchema = z
  .object({
    customer: z.object({
      name: z
        .string({ required_error: 'El campo name es requerido' })
        .min(2, 'El nombre debe tener al menos 2 caracteres'),
      phone: z
        .string({ required_error: 'El campo phone es requerido' })
        .regex(phoneRegex, 'El teléfono debe tener entre 10 y 13 dígitos sin espacios ni guiones'),
      email: z.string().email('El email no tiene un formato válido').optional(),
    }),
    items: z
      .array(orderItemSchema)
      .min(1, 'items debe contener al menos un producto'),
    delivery_type: z.enum(['shipping', 'pickup'], {
      required_error: 'delivery_type es requerido',
      invalid_type_error: "delivery_type debe ser 'shipping' o 'pickup'",
    }),
    delivery_address: z.string().optional(),
    notes: z.string().max(500, 'Las notas no pueden superar los 500 caracteres').optional(),
  })
  .refine(
    (data) => data.delivery_type !== 'shipping' || !!data.delivery_address?.trim(),
    {
      message: "delivery_address es requerido cuando delivery_type es 'shipping'",
      path: ['delivery_address'],
    }
  )

export type CreateOrderInput = z.infer<typeof createOrderSchema>
