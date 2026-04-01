import { createClient } from '@/lib/supabase/server'

export type CategoryOption = Readonly<{
  id: string
  name: string
  slug: string
  sort_order: number
}>

export async function getCategories(): Promise<CategoryOption[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, sort_order')
    .eq('active', true)
    .order('sort_order', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}
