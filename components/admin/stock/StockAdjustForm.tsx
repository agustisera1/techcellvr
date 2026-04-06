'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { SheetClose, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormField as Field } from '@/components/shared/form-field'
import { adjustStockSchema, type AdjustStockInput } from '@/lib/validations/stock'
import { adjustStockAction } from '@/app/admin/stock/actions'

interface ProductOption {
  id: string
  name: string
  stock: number
}

interface StockAdjustFormProps {
  products: ProductOption[]
  initialProductId?: string
  onClose: () => void
}

export function StockAdjustForm({ products, initialProductId, onClose }: StockAdjustFormProps) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AdjustStockInput>({
    resolver: zodResolver(adjustStockSchema),
    defaultValues: {
      product_id: initialProductId ?? '',
      quantity: undefined,
      reason: '',
    },
  })

  const selectedProductId = watch('product_id')
  const selectedProduct = products.find((p) => p.id === selectedProductId)

  const onSubmit = async (data: AdjustStockInput) => {
    const result = await adjustStockAction(data)
    if (result.success) {
      toast.success('Stock ajustado')
      router.refresh()
      onClose()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <>
      <SheetHeader className="px-6 pt-6">
        <SheetTitle className="text-xl">Ajuste de stock</SheetTitle>
        <p className="text-sm text-muted-foreground">
          Registra una entrada o salida manual. Cantidad positiva = ingreso, negativa = egreso.
        </p>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <form id="stock-adjust-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Producto */}
          <Field error={errors.product_id?.message}>
            <Label>Producto *</Label>
            <Controller
              name="product_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                        <span className="ml-2 text-xs text-muted-foreground">
                          (stock actual: {p.stock})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          {/* Cantidad */}
          <Field
            error={errors.quantity?.message}
            hint={
              selectedProduct != null
                ? `Stock actual: ${selectedProduct.stock} unidades`
                : 'Positivo = ingreso · Negativo = egreso'
            }
          >
            <Label htmlFor="quantity">Cantidad *</Label>
            <Input
              id="quantity"
              type="number"
              step="1"
              placeholder="Ej: 10 o -3"
              {...register('quantity', { valueAsNumber: true })}
            />
          </Field>

          {/* Motivo */}
          <Field error={errors.reason?.message} hint="Obligatorio para el audit trail.">
            <Label htmlFor="reason">Motivo *</Label>
            <Input
              id="reason"
              placeholder="Ej: Reposición, Merma, Corrección de inventario..."
              {...register('reason')}
            />
          </Field>

        </form>
      </div>

      <SheetFooter className="border-t px-6 pb-6 pt-4">
        <SheetClose asChild>
          <Button type="button" variant="outline">Cancelar</Button>
        </SheetClose>
        <Button type="submit" form="stock-adjust-form" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Registrar ajuste'}
        </Button>
      </SheetFooter>
    </>
  )
}
