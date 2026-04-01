'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Percent, Trash2 } from 'lucide-react'
import { SheetClose, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createDiscountSchema, type CreateDiscountInput } from '@/lib/validations/products'
import {
  createDiscountAction,
  deactivateDiscountAction,
} from '@/app/admin/products/actions'
import { formatARS, formatDateTime } from '@/lib/format'
import type { DiscountRow, ProductWithCategory } from '@/lib/products-service'

interface DiscountFormProps {
  product: ProductWithCategory
  discount: DiscountRow | null
  onClose: () => void
}

export function DiscountForm({ product, discount, onClose }: DiscountFormProps) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateDiscountInput>({
    resolver: zodResolver(createDiscountSchema),
    defaultValues: {
      product_id: product.id,
      percentage: discount?.percentage ?? undefined,
      reason: discount?.reason ?? '',
    },
  })

  const onSubmit = async (data: CreateDiscountInput) => {
    const result = await createDiscountAction(product.id, data)
    if (result.success) {
      toast.success('Descuento guardado')
      router.refresh()
      onClose()
    } else {
      toast.error(result.error)
    }
  }

  const handleDeactivate = async () => {
    if (!discount) return
    const result = await deactivateDiscountAction(discount.id)
    if (result.success) {
      toast.success('Descuento quitado')
      router.refresh()
      onClose()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <>
      <SheetHeader className="px-6 pt-6">
        <SheetTitle>Descuento</SheetTitle>
        <p className="text-sm text-muted-foreground">{product.name}</p>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {discount && (
          <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
            <div className="space-y-0.5">
              <p className="font-medium text-amber-900 dark:text-amber-200">
                Descuento activo: {discount.percentage}%
              </p>
              {discount.reason && (
                <p className="text-xs text-amber-700 dark:text-amber-400">{discount.reason}</p>
              )}
              {discount.valid_until && (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Vence: {formatDateTime(discount.valid_until)}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={handleDeactivate}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )}

        <form id="discount-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('product_id')} />

          <div className="space-y-1.5">
            <Label htmlFor="percentage">Porcentaje *</Label>
            <div className="relative">
              <Input
                id="percentage"
                type="number"
                min="1"
                max="100"
                step="0.5"
                className="pr-8"
                {...register('percentage', { valueAsNumber: true })}
              />
              <Percent className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            {errors.percentage && (
              <p className="text-xs text-destructive">{errors.percentage.message}</p>
            )}
            {product.price > 0 && (
              <p className="text-xs text-muted-foreground">
                Precio actual: {formatARS(product.price)}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reason">Motivo (opcional)</Label>
            <Input id="reason" placeholder="Ej: Liquidación, Lanzamiento..." {...register('reason')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="valid_from">Válido desde</Label>
              <Input
                id="valid_from"
                type="datetime-local"
                {...register('valid_from')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="valid_until">Válido hasta</Label>
              <Input
                id="valid_until"
                type="datetime-local"
                {...register('valid_until')}
              />
            </div>
          </div>
        </form>
      </div>

      <SheetFooter className="px-6 pb-6 pt-4 border-t">
        <SheetClose asChild>
          <Button type="button" variant="outline">Cancelar</Button>
        </SheetClose>
        <Button type="submit" form="discount-form" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : discount ? 'Reemplazar descuento' : 'Aplicar descuento'}
        </Button>
      </SheetFooter>
    </>
  )
}
