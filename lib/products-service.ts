import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/database.types'
import type {
  CreateProductInput,
  UpdateProductInput,
  CreateDiscountInput,
} from '@/lib/validations/products'

export type ProductRow = Readonly<Tables<'products'>>

export type ProductWithCategory = Readonly<
  Tables<'products'> & {
    category_name: string | null
    image_url: string | null
  }
>

export type DiscountRow = Readonly<Tables<'discounts'>>
export type PriceHistoryRow = Readonly<Tables<'price_history'>>

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<ProductWithCategory[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(
      `id, category_id, name, slug, description, sku,
       price, compare_at_price, stock, stock_min_threshold,
       active, featured, created_at, updated_at,
       categories (name),
       product_images (url, is_primary)`,
    )
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase nested select requires manual mapping
  return (data ?? []).map((p: any) => {
    const images = (p.product_images ?? []) as Array<{
      url: string
      is_primary: boolean
    }>
    return {
      id: p.id,
      category_id: p.category_id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      sku: p.sku,
      price: p.price,
      compare_at_price: p.compare_at_price,
      stock: p.stock,
      stock_min_threshold: p.stock_min_threshold,
      active: p.active,
      featured: p.featured,
      created_at: p.created_at,
      updated_at: p.updated_at,
      category_name: (p.categories as { name: string } | null)?.name ?? null,
      image_url:
        images.find((img) => img.is_primary)?.url ?? images[0]?.url ?? null,
    }
  })
}

export async function getProduct(id: string): Promise<ProductRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(
      'id, category_id, name, slug, description, sku, price, compare_at_price, stock, stock_min_threshold, active, featured, created_at, updated_at',
    )
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

export async function createProduct(input: CreateProductInput): Promise<ProductRow> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      category_id: input.category_id ?? null,
      sku: input.sku ?? null,
      price: input.price,
      compare_at_price: input.compare_at_price ?? null,
      stock: input.stock ?? 0,
      stock_min_threshold: input.stock_min_threshold ?? 0,
      active: input.active ?? true,
      featured: input.featured ?? false,
    })
    .select(
      'id, category_id, name, slug, description, sku, price, compare_at_price, stock, stock_min_threshold, active, featured, created_at, updated_at',
    )
    .single()

  if (error) throw new Error(error.message)

  // Record initial stock movement
  if (input.stock && input.stock > 0) {
    await supabase.from('stock_movements').insert({
      product_id: data.id,
      type: 'initial',
      quantity: input.stock,
      stock_before: 0,
      stock_after: input.stock,
      reason: 'Stock inicial al crear producto',
    })
  }

  return data
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput,
): Promise<ProductRow> {
  const supabase = await createClient()

  const patch: Record<string, unknown> = {}
  if (input.name !== undefined) patch.name = input.name
  if (input.slug !== undefined) patch.slug = input.slug
  if (input.description !== undefined) patch.description = input.description ?? null
  if (input.category_id !== undefined) patch.category_id = input.category_id ?? null
  if (input.sku !== undefined) patch.sku = input.sku ?? null
  if (input.price !== undefined) patch.price = input.price
  if (input.compare_at_price !== undefined) patch.compare_at_price = input.compare_at_price ?? null
  if (input.stock_min_threshold !== undefined) patch.stock_min_threshold = input.stock_min_threshold
  if (input.active !== undefined) patch.active = input.active
  if (input.featured !== undefined) patch.featured = input.featured

  const { data, error } = await supabase
    .from('products')
    .update(patch)
    .eq('id', id)
    .select(
      'id, category_id, name, slug, description, sku, price, compare_at_price, stock, stock_min_threshold, active, featured, created_at, updated_at',
    )
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function toggleProductActive(id: string, active: boolean): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('products').update({ active }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function updateProductImage(
  productId: string,
  url: string,
): Promise<void> {
  const supabase = await createClient()
  // Mark all existing images as non-primary
  await supabase
    .from('product_images')
    .update({ is_primary: false })
    .eq('product_id', productId)

  // Upsert primary image
  const { error } = await supabase.from('product_images').insert({
    product_id: productId,
    url,
    is_primary: true,
    sort_order: 0,
  })
  if (error) throw new Error(error.message)
}

// ─── Discounts ────────────────────────────────────────────────────────────────

export async function getActiveDiscount(productId: string): Promise<DiscountRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('discounts')
    .select(
      'id, product_id, percentage, reason, valid_from, valid_until, active, created_at, updated_at',
    )
    .eq('product_id', productId)
    .eq('active', true)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

export async function createDiscount(
  productId: string,
  input: CreateDiscountInput,
): Promise<DiscountRow> {
  const supabase = await createClient()

  // Only one active discount per product
  await supabase
    .from('discounts')
    .update({ active: false })
    .eq('product_id', productId)
    .eq('active', true)

  const { data, error } = await supabase
    .from('discounts')
    .insert({
      product_id: productId,
      percentage: input.percentage,
      reason: input.reason ?? null,
      valid_from: input.valid_from ?? null,
      valid_until: input.valid_until ?? null,
      active: true,
    })
    .select(
      'id, product_id, percentage, reason, valid_from, valid_until, active, created_at, updated_at',
    )
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deactivateDiscount(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('discounts')
    .update({ active: false })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

// ─── Price history ────────────────────────────────────────────────────────────

export async function getPriceHistory(productId: string): Promise<PriceHistoryRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('price_history')
    .select('id, product_id, changed_by, old_price, new_price, changed_at')
    .eq('product_id', productId)
    .order('changed_at', { ascending: false })
    .limit(50)
  if (error) throw new Error(error.message)
  return data ?? []
}
