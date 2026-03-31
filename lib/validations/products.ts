import { z } from 'zod'

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const createProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z
    .string()
    .min(1, 'El slug es requerido')
    .regex(slugRegex, 'El slug solo puede contener letras minúsculas, números y guiones'),
  description: z.string().optional(),
  category_id: z.string().uuid().nullable().optional(),
  sku: z.string().nullable().optional(),
  price: z
    .number({ invalid_type_error: 'El precio debe ser un número' })
    .min(0, 'El precio no puede ser negativo'),
  compare_at_price: z
    .number()
    .min(0, 'El precio de comparación no puede ser negativo')
    .nullable()
    .optional(),
  stock: z
    .number({ invalid_type_error: 'El stock debe ser un número' })
    .int('El stock debe ser un entero')
    .min(0, 'El stock no puede ser negativo')
    .default(0),
  stock_min_threshold: z
    .number()
    .int()
    .min(0)
    .default(0),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
})

export const updateProductSchema = createProductSchema.partial()

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>

// Discount form schema
export const createDiscountSchema = z.object({
  product_id: z.string().uuid(),
  percentage: z
    .number()
    .min(1, 'El porcentaje debe ser mayor a 0')
    .max(100, 'El porcentaje no puede superar 100'),
  reason: z.string().optional(),
  valid_from: z.string().datetime().nullable().optional(),
  valid_until: z.string().datetime().nullable().optional(),
})

export type CreateDiscountInput = z.infer<typeof createDiscountSchema>
