'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon, Percent, Trash2 } from 'lucide-react'
import { SheetClose, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { createDiscountSchema, type CreateDiscountInput } from '@/lib/validations/products'
import { createDiscountAction, deactivateDiscountAction } from '@/app/admin/products/actions'
import { FormField as Field } from '@/components/shared/form-field'
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
    control,
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
        <SheetTitle className="text-xl">Descuento</SheetTitle>
        <p className="text-sm text-muted-foreground">{product.name}</p>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {/* Descuento activo */}
        {discount && (
          <div className="mb-5 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
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

        <form id="discount-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <input type="hidden" {...register('product_id')} />

          {/* Porcentaje */}
          <Field
            error={errors.percentage?.message}
            hint={product.price > 0 ? `Precio actual: ${formatARS(product.price)}` : undefined}
          >
            <Label htmlFor="percentage">Porcentaje *</Label>
            <div className="relative">
              <Input
                id="percentage"
                type="number"
                min="1"
                max="100"
                step="0.5"
                placeholder="10"
                className="pr-8"
                {...register('percentage', { valueAsNumber: true })}
              />
              <Percent className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </Field>

          {/* Motivo */}
          <Field hint="Opcional — se muestra internamente para identificar la promo.">
            <Label htmlFor="reason">Motivo</Label>
            <Input
              id="reason"
              placeholder="Ej: Liquidación, Lanzamiento, Cyber Monday..."
              {...register('reason')}
            />
          </Field>

          {/* Fechas de vigencia */}
          <div className="grid grid-cols-2 gap-4">
            <Field hint="Opcional — sin fecha, aplica de inmediato.">
              <Label>Válido desde</Label>
              <Controller
                name="valid_from"
                control={control}
                render={({ field }) => {
                  const date = field.value ? new Date(field.value) : undefined
                  return (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 size-4 shrink-0 text-muted-foreground" />
                          {date ? (
                            format(date, 'dd/MM/yyyy', { locale: es })
                          ) : (
                            <span className="text-muted-foreground">Seleccionar</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(d) => field.onChange(d ? d.toISOString() : undefined)}
                          locale={es}
                          className="w-full"
                        />
                      </PopoverContent>
                    </Popover>
                  )
                }}
              />
            </Field>

            <Field hint="Opcional — sin fecha, no expira.">
              <Label>Válido hasta</Label>
              <Controller
                name="valid_until"
                control={control}
                render={({ field }) => {
                  const date = field.value ? new Date(field.value) : undefined
                  return (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 size-4 shrink-0 text-muted-foreground" />
                          {date ? (
                            format(date, 'dd/MM/yyyy', { locale: es })
                          ) : (
                            <span className="text-muted-foreground">Seleccionar</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(d) => field.onChange(d ? d.toISOString() : undefined)}
                          locale={es}
                          className="w-full"
                        />
                      </PopoverContent>
                    </Popover>
                  )
                }}
              />
            </Field>
          </div>
        </form>
      </div>

      <SheetFooter className="border-t px-6 pb-6 pt-4">
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
