import { z } from 'zod'

const phoneRegex = /^\d{10,13}$/

export const customerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z
    .string()
    .regex(phoneRegex, 'El teléfono debe tener entre 10 y 13 dígitos sin espacios ni guiones'),
  email: z.string().email('El email no tiene un formato válido').nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export type CustomerInput = z.infer<typeof customerSchema>
