import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/database.types'
import type { AdjustStockInput } from '@/lib/validations/stock'

export type StockMovementRow = Readonly<Tables<'stock_movements'>>

export type StockMovementWithProduct = Readonly<
  Tables<'stock_movements'> & {
    product_name: string
    product_sku: string | null
  }
>

// ─── Stock movements ──────────────────────────────────────────────────────────

export async function getStockMovements(): Promise<StockMovementWithProduct[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('stock_movements')
    .select(
      `id, product_id, moved_by, order_item_id, type,
       quantity, stock_before, stock_after, reason, created_at,
       products (name, sku)`,
    )
    .order('created_at', { ascending: false })
    .limit(300)

  if (error) throw new Error(error.message)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase nested select requires manual mapping
  return (data ?? []).map((m: any) => {
    const product = m.products as { name: string; sku: string | null } | null
    return {
      id: m.id,
      product_id: m.product_id,
      moved_by: m.moved_by,
      order_item_id: m.order_item_id,
      type: m.type,
      quantity: m.quantity,
      stock_before: m.stock_before,
      stock_after: m.stock_after,
      reason: m.reason,
      created_at: m.created_at,
      product_name: product?.name ?? '(sin nombre)',
      product_sku: product?.sku ?? null,
    }
  })
}

export async function adjustStock(input: AdjustStockInput): Promise<StockMovementRow> {
  const supabase = await createClient()

  // Fetch current stock — no trigger inserts to stock_movements on UPDATE
  // (products_stock_change was dropped in migration 0006), so we do it manually.
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('stock')
    .eq('id', input.product_id)
    .single()

  if (productError) throw new Error(productError.message)

  const stockBefore = product.stock
  const stockAfter = Math.max(0, stockBefore + input.quantity)

  const { error: updateError } = await supabase
    .from('products')
    .update({ stock: stockAfter })
    .eq('id', input.product_id)

  if (updateError) throw new Error(updateError.message)

  const { data: movement, error: movementError } = await supabase
    .from('stock_movements')
    .insert({
      product_id: input.product_id,
      type: 'adjustment',
      quantity: input.quantity,
      stock_before: stockBefore,
      stock_after: stockAfter,
      reason: input.reason,
    })
    .select(
      'id, product_id, moved_by, order_item_id, type, quantity, stock_before, stock_after, reason, created_at',
    )
    .single()

  if (movementError) throw new Error(movementError.message)
  return movement
}

// ─── Low stock ────────────────────────────────────────────────────────────────

export async function getLowStockCount(): Promise<number> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('stock, stock_min_threshold')
    .eq('active', true)
    .not('stock_min_threshold', 'is', null)

  if (error) throw new Error(error.message)

  return (data ?? []).filter(
    (p) => p.stock_min_threshold != null && p.stock <= p.stock_min_threshold,
  ).length
}
