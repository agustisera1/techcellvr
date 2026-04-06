import { z } from 'zod'

export const adjustStockSchema = z.object({
  product_id: z.string().uuid('Producto inválido'),
  quantity: z
    .number({ error: 'La cantidad debe ser un número' })
    .int('La cantidad debe ser un número entero')
    .refine((q) => q !== 0, { message: 'La cantidad no puede ser 0' }),
  reason: z.string().min(1, 'El motivo es obligatorio'),
})

export type AdjustStockInput = z.infer<typeof adjustStockSchema>
