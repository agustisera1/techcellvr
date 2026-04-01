'use server'

import { revalidatePath } from 'next/cache'
import { getAuthenticatedUser } from '@/lib/supabase/get-user'
import {
  createProduct,
  updateProduct,
  toggleProductActive,
  updateProductImage,
  createDiscount,
  deactivateDiscount,
  getActiveDiscount,
  getPriceHistory,
  type DiscountRow,
  type PriceHistoryRow,
} from '@/lib/products-service'
import {
  createProductSchema,
  updateProductSchema,
  createDiscountSchema,
} from '@/lib/validations/products'
import type { ActionResult } from '@/lib/types/actions'

export async function createProductAction(
  data: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    await getAuthenticatedUser()
    const parsed = createProductSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
    }
    const product = await createProduct(parsed.data)
    revalidatePath('/admin/products', 'page')
    return { success: true, data: { id: product.id } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error al crear el producto' }
  }
}

export async function updateProductAction(
  id: string,
  data: unknown,
): Promise<ActionResult> {
  try {
    await getAuthenticatedUser()
    const parsed = updateProductSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
    }
    await updateProduct(id, parsed.data)
    revalidatePath('/admin/products', 'page')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error al actualizar el producto' }
  }
}

export async function toggleProductActiveAction(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  try {
    await getAuthenticatedUser()
    await toggleProductActive(id, active)
    revalidatePath('/admin/products', 'page')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error al actualizar el producto' }
  }
}

export async function updateProductImageAction(
  productId: string,
  url: string,
): Promise<ActionResult> {
  try {
    await getAuthenticatedUser()
    await updateProductImage(productId, url)
    revalidatePath('/admin/products', 'page')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error al guardar la imagen' }
  }
}

export async function getActiveDiscountAction(
  productId: string,
): Promise<ActionResult<DiscountRow | null>> {
  try {
    await getAuthenticatedUser()
    const discount = await getActiveDiscount(productId)
    return { success: true, data: discount }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error al obtener el descuento' }
  }
}

export async function createDiscountAction(
  productId: string,
  data: unknown,
): Promise<ActionResult> {
  try {
    await getAuthenticatedUser()
    const parsed = createDiscountSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
    }
    await createDiscount(productId, parsed.data)
    revalidatePath('/admin/products', 'page')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error al crear el descuento' }
  }
}

export async function deactivateDiscountAction(id: string): Promise<ActionResult> {
  try {
    await getAuthenticatedUser()
    await deactivateDiscount(id)
    revalidatePath('/admin/products', 'page')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error al quitar el descuento' }
  }
}

export async function getPriceHistoryAction(
  productId: string,
): Promise<ActionResult<PriceHistoryRow[]>> {
  try {
    await getAuthenticatedUser()
    const history = await getPriceHistory(productId)
    return { success: true, data: history }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error al obtener el historial' }
  }
}
