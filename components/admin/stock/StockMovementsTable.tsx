'use client'

import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/shared/data-table'
import { StockAdjustForm } from './StockAdjustForm'
import { formatDateTime } from '@/lib/format'
import type { StockMovementWithProduct } from '@/lib/stock-service'
import type { StockMovementType } from '@/lib/database.types'
import type { ProductWithCategory } from '@/lib/products-service'

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 15

const TYPE_LABEL: Record<StockMovementType, string> = {
  initial: 'Inicial',
  adjustment: 'Ajuste',
  sale: 'Venta',
  return: 'Devolución',
  manual_entry: 'Ingreso',
}

type TypeFilter = StockMovementType | 'all'

// ─── Props ────────────────────────────────────────────────────────────────────

interface StockMovementsTableProps {
  movements: StockMovementWithProduct[]
  products: ProductWithCategory[]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StockMovementsTable({ movements, products }: StockMovementsTableProps) {
  const [filters, setFilters] = useState({
    search: '',
    type: 'all' as TypeFilter,
  })
  const [sheetOpen, setSheetOpen] = useState(false)

  // Simplified product options for the adjust form
  const productOptions = useMemo(
    () => products.map((p) => ({ id: p.id, name: p.name, stock: p.stock })),
    [products],
  )

  // ─── Filtered data ─────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const { search, type } = filters
    const q = search.toLowerCase()
    return movements.filter((m) => {
      if (q && !m.product_name.toLowerCase().includes(q)) return false
      if (type !== 'all' && m.type !== type) return false
      return true
    })
  }, [movements, filters])

  // ─── Columns ───────────────────────────────────────────────────────────────

  const columns: ColumnDef<StockMovementWithProduct>[] = useMemo(
    () => [
      {
        id: 'date',
        header: 'Fecha',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatDateTime(row.original.created_at)}
          </span>
        ),
      },
      {
        id: 'product',
        header: 'Producto',
        cell: ({ row }) => {
          const { product_name, product_sku } = row.original
          return (
            <div className="min-w-[140px]">
              <p className="font-medium leading-tight">{product_name}</p>
              {product_sku && (
                <p className="text-xs text-muted-foreground">{product_sku}</p>
              )}
            </div>
          )
        },
      },
      {
        id: 'type',
        header: 'Tipo',
        cell: ({ row }) => {
          const type = row.original.type
          return (
            <Badge variant="secondary" className="whitespace-nowrap font-normal">
              {TYPE_LABEL[type]}
            </Badge>
          )
        },
      },
      {
        id: 'quantity',
        header: 'Cantidad',
        cell: ({ row }) => {
          const q = row.original.quantity
          const isPositive = q > 0
          return (
            <span
              className={`font-mono font-semibold ${
                isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
              }`}
            >
              {isPositive ? '+' : ''}{q}
            </span>
          )
        },
      },
      {
        id: 'stock_before',
        header: 'Stock ant.',
        cell: ({ row }) => (
          <span className="font-mono text-sm text-muted-foreground">
            {row.original.stock_before}
          </span>
        ),
      },
      {
        id: 'stock_after',
        header: 'Stock nuevo',
        cell: ({ row }) => (
          <span className="font-mono text-sm font-medium">
            {row.original.stock_after}
          </span>
        ),
      },
      {
        id: 'reason',
        header: 'Motivo',
        cell: ({ row }) =>
          row.original.reason ? (
            <span className="max-w-[200px] truncate text-sm">{row.original.reason}</span>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          ),
      },
    ],
    [],
  )

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Stock</h1>
          <p className="text-sm text-muted-foreground">
            {movements.length} movimiento{movements.length === 1 ? '' : 's'} registrado{movements.length === 1 ? '' : 's'}
          </p>
        </div>
        <Button onClick={() => setSheetOpen(true)}>
          Nuevo ajuste
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Buscar por producto..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          className="max-w-xs"
        />
        <Select
          value={filters.type}
          onValueChange={(v) => setFilters((f) => ({ ...f, type: v as TypeFilter }))}
        >
          <SelectTrigger className="w-auto min-w-[150px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="adjustment">Ajuste</SelectItem>
            <SelectItem value="initial">Inicial</SelectItem>
            <SelectItem value="manual_entry">Ingreso manual</SelectItem>
            <SelectItem value="sale">Venta</SelectItem>
            <SelectItem value="return">Devolución</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        key={`${filters.search}-${filters.type}`}
        columns={columns}
        data={filtered}
        pageSize={PAGE_SIZE}
        emptyMessage={
          movements.length === 0
            ? 'No hay movimientos de stock registrados aún.'
            : 'Ningún movimiento coincide con los filtros.'
        }
      />

      {/* Adjust sheet */}
      <Sheet open={sheetOpen} onOpenChange={(open) => { if (!open) setSheetOpen(false) }}>
        <SheetContent className="flex flex-col p-0 sm:max-w-xl">
          <StockAdjustForm
            products={productOptions}
            onClose={() => setSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
