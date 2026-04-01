import { Suspense } from 'react'
import { getProducts } from '@/lib/products-service'
import { getCategories } from '@/lib/categories-service'
import { ProductsTable } from '@/components/admin/products/ProductsTable'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<ProductsTableSkeleton />}>
      <ProductsContent />
    </Suspense>
  )
}

async function ProductsContent() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()])
  return <ProductsTable products={products} categories={categories} />
}

function ProductsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-[400px] w-full rounded-md" />
    </div>
  )
}
