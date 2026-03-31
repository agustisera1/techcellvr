import { z } from 'zod'

export const updateSettingSchema = z.object({
  key: z.string().min(1, 'La clave es requerida'),
  value: z.string(),
})

export const updateSettingsSchema = z.array(updateSettingSchema).min(1)

export type UpdateSettingInput = z.infer<typeof updateSettingSchema>
