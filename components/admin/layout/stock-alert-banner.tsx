'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface StockAlertBannerProps {
  lowStockCount: number
  stockHref?: string
  className?: string
}

export function StockAlertBanner({
  lowStockCount,
  stockHref = '/admin/stock',
  className,
}: StockAlertBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (lowStockCount <= 0 || dismissed) return null

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-b border-primary/20 bg-primary/8 px-4 py-2 text-sm text-primary dark:text-primary',
        className,
      )}
      role="status"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-4 shrink-0" aria-hidden />
        <span>
          Hay{' '}
          <strong>
            {lowStockCount} producto{lowStockCount === 1 ? '' : 's'}
          </strong>{' '}
          con stock por debajo del umbral mínimo.
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          asChild
          size="sm"
          variant="outline"
          className="border-primary/30 text-primary hover:bg-primary/10"
        >
          <Link href={stockHref}>Ver stock</Link>
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-7 text-primary hover:bg-primary/10 hover:text-primary"
          onClick={() => setDismissed(true)}
          aria-label="Cerrar alerta"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  )
}
