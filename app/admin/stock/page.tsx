import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { StockMovementsTable } from '@/components/admin/stock/StockMovementsTable'
import { getStockMovements } from '@/lib/stock-service'
import { getProducts } from '@/lib/products-service'

export default function AdminStockPage() {
  return (
    <Suspense fallback={<StockTableSkeleton />}>
      <StockContent />
    </Suspense>
  )
}

async function StockContent() {
  const [movements, products] = await Promise.all([
    getStockMovements(),
    getProducts(),
  ])
  return <StockMovementsTable movements={movements} products={products} />
}

function StockTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-36" />
      </div>
      <Skeleton className="h-[400px] w-full rounded-lg" />
    </div>
  )
}
