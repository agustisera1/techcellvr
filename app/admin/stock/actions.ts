'use server'

import { revalidatePath } from 'next/cache'
import { getAuthenticatedUser } from '@/lib/supabase/get-user'
import { adjustStock } from '@/lib/stock-service'
import { adjustStockSchema } from '@/lib/validations/stock'
import type { ActionResult } from '@/lib/types/actions'

export async function adjustStockAction(data: unknown): Promise<ActionResult> {
  try {
    await getAuthenticatedUser()
    const parsed = adjustStockSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
    }
    await adjustStock(parsed.data)
    revalidatePath('/admin/stock', 'page')
    revalidatePath('/admin/products', 'page')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error al ajustar el stock' }
  }
}
