'use client'

import { ArrowRight } from 'lucide-react'
import { SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { formatARS, formatDateTime } from '@/lib/format'
import type { PriceHistoryRow, ProductWithCategory } from '@/lib/products-service'

interface PriceHistoryDrawerProps {
  product: ProductWithCategory
  history: PriceHistoryRow[]
  onClose: () => void
}

export function PriceHistoryDrawer({
  product,
  history,
  onClose,
}: PriceHistoryDrawerProps) {
  return (
    <>
      <SheetHeader className="px-6 pt-6">
        <SheetTitle>Historial de precios</SheetTitle>
        <p className="text-sm text-muted-foreground">{product.name}</p>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {history.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No hay cambios de precio registrados.
          </p>
        ) : (
          <ol className="space-y-3">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span className="line-through">{formatARS(entry.old_price)}</span>
                  <ArrowRight className="size-4 shrink-0" />
                  <span className="font-medium text-foreground">
                    {formatARS(entry.new_price)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(entry.changed_at)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="border-t px-6 py-4">
        <Button variant="outline" onClick={onClose} className="w-full">
          Cerrar
        </Button>
      </div>
    </>
  )
}
