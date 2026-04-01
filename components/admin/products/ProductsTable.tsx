'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { MoreHorizontal, Percent, History, Pencil, Power, Plus } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable } from '@/components/shared/data-table'
import { ProductFilters } from './ProductFilters'
import { ProductForm } from './ProductForm'
import { DiscountForm } from './DiscountForm'
import { PriceHistoryDrawer } from './PriceHistoryDrawer'
import {
  getActiveDiscountAction,
  getPriceHistoryAction,
  toggleProductActiveAction,
} from '@/app/admin/products/actions'
import { formatARS } from '@/lib/format'
import type { CategoryOption } from '@/lib/categories-service'
import type { DiscountRow, PriceHistoryRow, ProductWithCategory } from '@/lib/products-service'
import type { StatusFilter } from './ProductFilters'

const PAGE_SIZE = 15

// ─── Sheet state ──────────────────────────────────────────────────────────────

type SheetState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'edit'; product: ProductWithCategory }
  | { type: 'discount'; product: ProductWithCategory; discount: DiscountRow | null }
  | { type: 'history'; product: ProductWithCategory; history: PriceHistoryRow[] }

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProductsTableProps {
  products: ProductWithCategory[]
  categories: CategoryOption[]
}

export function ProductsTable({ products, categories }: ProductsTableProps) {
  const router = useRouter()

  // Filter state
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [lowStock, setLowStock] = useState(false)

  // Sheet state
  const [sheet, setSheet] = useState<SheetState>({ type: 'none' })

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleOpenDiscount = async (product: ProductWithCategory) => {
    const result = await getActiveDiscountAction(product.id)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    setSheet({ type: 'discount', product, discount: result.data })
  }

  const handleOpenHistory = async (product: ProductWithCategory) => {
    const result = await getPriceHistoryAction(product.id)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    setSheet({ type: 'history', product, history: result.data })
  }

  const handleToggleActive = async (product: ProductWithCategory) => {
    const result = await toggleProductActiveAction(product.id, !product.active)
    if (result.success) {
      toast.success(product.active ? 'Producto desactivado' : 'Producto activado')
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  // ─── Filtered data ──────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !(p.sku ?? '').toLowerCase().includes(q)) {
        return false
      }
      if (categoryId !== 'all' && p.category_id !== categoryId) return false
      if (status === 'active' && !p.active) return false
      if (status === 'inactive' && p.active) return false
      if (lowStock && p.stock > (p.stock_min_threshold ?? 0)) return false
      return true
    })
  }, [products, search, categoryId, status, lowStock])

  // ─── Columns ─────────────────────────────────────────────────────────────────

  const columns: ColumnDef<ProductWithCategory>[] = useMemo(
    () => [
      {
        id: 'image',
        header: '',
        cell: ({ row }) => {
          const url = row.original.image_url
          return url ? (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted">
              <Image src={url} alt={row.original.name} fill className="object-cover" />
            </div>
          ) : (
            <div className="h-10 w-10 shrink-0 rounded-md border bg-muted" />
          )
        },
      },
      {
        id: 'name',
        header: 'Producto',
        cell: ({ row }) => {
          const { name, sku } = row.original
          return (
            <div className="min-w-[160px]">
              <p className="font-medium leading-tight">{name}</p>
              {sku && <p className="text-xs text-muted-foreground">{sku}</p>}
            </div>
          )
        },
      },
      {
        id: 'category',
        header: 'Categoría',
        cell: ({ row }) =>
          row.original.category_name ? (
            <span className="text-sm">{row.original.category_name}</span>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          ),
      },
      {
        id: 'price',
        header: 'Precio',
        cell: ({ row }) => {
          const { price, compare_at_price } = row.original
          return (
            <div className="text-sm">
              <p className="font-medium">{formatARS(price)}</p>
              {compare_at_price != null && (
                <p className="text-xs text-muted-foreground line-through">
                  {formatARS(compare_at_price)}
                </p>
              )}
            </div>
          )
        },
      },
      {
        id: 'stock',
        header: 'Stock',
        cell: ({ row }) => {
          const { stock, stock_min_threshold } = row.original
          const isLow = stock <= (stock_min_threshold ?? 0)
          return (
            <Badge variant={isLow ? 'destructive' : 'secondary'} className="font-mono">
              {stock}
            </Badge>
          )
        },
      },
      {
        id: 'active',
        header: 'Estado',
        cell: ({ row }) =>
          row.original.active ? (
            <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-500/80">
              Activo
            </Badge>
          ) : (
            <Badge variant="secondary">Inactivo</Badge>
          ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const product = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">Acciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem
                  onSelect={() => setSheet({ type: 'edit', product })}
                >
                  <Pencil className="mr-2 size-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleOpenDiscount(product)}>
                  <Percent className="mr-2 size-4" />
                  Descuento
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleOpenHistory(product)}>
                  <History className="mr-2 size-4" />
                  Historial de precios
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => handleToggleActive(product)}>
                  <Power className="mr-2 size-4" />
                  {product.active ? 'Desactivar' : 'Activar'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  // ─── Render ──────────────────────────────────────────────────────────────────

  const isOpen = sheet.type !== 'none'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
          <p className="text-sm text-muted-foreground">{products.length} productos en total</p>
        </div>
        <Button onClick={() => setSheet({ type: 'create' })}>
          <Plus className="mr-2 size-4" />
          Nuevo producto
        </Button>
      </div>

      {/* Filters */}
      <ProductFilters
        search={search}
        onSearchChange={(v) => setSearch(v)}
        categoryId={categoryId}
        onCategoryChange={(v) => setCategoryId(v)}
        status={status}
        onStatusChange={(v) => setStatus(v)}
        lowStock={lowStock}
        onLowStockChange={(v) => setLowStock(v)}
        categories={categories}
      />

      {/* Table — key resets pagination when filters change */}
      <DataTable
        key={`${search}-${categoryId}-${status}-${lowStock}`}
        columns={columns}
        data={filtered}
        pageSize={PAGE_SIZE}
        emptyMessage={
          products.length === 0
            ? 'No hay productos cargados aún.'
            : 'Ningún producto coincide con los filtros.'
        }
      />

      {/* Sheets */}
      <Sheet open={isOpen} onOpenChange={(open) => { if (!open) setSheet({ type: 'none' }) }}>
        <SheetContent className="sm:max-w-xl flex flex-col p-0">
          {sheet.type === 'create' && (
            <ProductForm
              categories={categories}
              onClose={() => setSheet({ type: 'none' })}
            />
          )}
          {sheet.type === 'edit' && (
            <ProductForm
              product={sheet.product}
              categories={categories}
              onClose={() => setSheet({ type: 'none' })}
            />
          )}
          {sheet.type === 'discount' && (
            <DiscountForm
              product={sheet.product}
              discount={sheet.discount}
              onClose={() => setSheet({ type: 'none' })}
            />
          )}
          {sheet.type === 'history' && (
            <PriceHistoryDrawer
              product={sheet.product}
              history={sheet.history}
              onClose={() => setSheet({ type: 'none' })}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
