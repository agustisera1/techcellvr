'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { CategoryOption } from '@/lib/categories-service'

export type StatusFilter = 'all' | 'active' | 'inactive'

interface ProductFiltersProps {
  search: string
  onSearchChange: (v: string) => void
  categoryId: string
  onCategoryChange: (v: string) => void
  status: StatusFilter
  onStatusChange: (v: StatusFilter) => void
  lowStock: boolean
  onLowStockChange: (v: boolean) => void
  categories: CategoryOption[]
}

export function ProductFilters({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  status,
  onStatusChange,
  lowStock,
  onLowStockChange,
  categories,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o SKU..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Category */}
      <Select value={categoryId} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-auto min-w-[140px]">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las categorías</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status */}
      <Select value={status} onValueChange={(v) => onStatusChange(v as StatusFilter)}>
        <SelectTrigger className="w-auto min-w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Activos</SelectItem>
          <SelectItem value="inactive">Inactivos</SelectItem>
        </SelectContent>
      </Select>

      {/* Low stock */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="low-stock"
          checked={lowStock}
          onCheckedChange={(v) => onLowStockChange(!!v)}
        />
        <Label htmlFor="low-stock" className="cursor-pointer text-sm">
          Stock bajo
        </Label>
      </div>
    </div>
  )
}
