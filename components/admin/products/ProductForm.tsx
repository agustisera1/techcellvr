'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  SheetClose,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageUploader } from '@/components/shared/ImageUploader'
import { z } from 'zod'
import { createProductSchema } from '@/lib/validations/products'

type ProductFormValues = z.input<typeof createProductSchema>
import { generateSlug } from '@/lib/utils/slug'
import { createProductAction, updateProductAction } from '@/app/admin/products/actions'
import type { CategoryOption } from '@/lib/categories-service'
import type { ProductWithCategory } from '@/lib/products-service'

const NO_CATEGORY = '__none__'

interface ProductFormProps {
  product?: ProductWithCategory
  categories: CategoryOption[]
  onClose: () => void
}

export function ProductForm({ product, categories, onClose }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!product
  const [slugLocked, setSlugLocked] = useState(isEdit)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: product
      ? {
          name: product.name,
          slug: product.slug,
          description: product.description ?? '',
          category_id: product.category_id ?? undefined,
          sku: product.sku ?? '',
          price: product.price,
          compare_at_price: product.compare_at_price ?? undefined,
          stock: product.stock,
          stock_min_threshold: product.stock_min_threshold ?? 0,
          active: product.active,
          featured: product.featured,
        }
      : {
          active: true,
          featured: false,
          stock: 0,
          stock_min_threshold: 0,
        },
  })

  const nameValue = watch('name')

  useEffect(() => {
    if (!slugLocked && nameValue) {
      setValue('slug', generateSlug(nameValue), { shouldValidate: false })
    }
  }, [nameValue, slugLocked, setValue])

  const onSubmit = async (data: ProductFormValues) => {
    const result = isEdit
      ? await updateProductAction(product.id, data)
      : await createProductAction(data)

    if (result.success) {
      toast.success(isEdit ? 'Producto actualizado' : 'Producto creado')
      router.refresh()
      onClose()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <>
      <SheetHeader className="px-6 pt-6">
        <SheetTitle>{isEdit ? 'Editar producto' : 'Nuevo producto'}</SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              {...register('slug')}
              onChange={(e) => {
                setSlugLocked(true)
                setValue('slug', e.target.value, { shouldValidate: true })
              }}
            />
            {!slugLocked && (
              <p className="text-xs text-muted-foreground">
                Auto-generado desde el nombre. Editá para personalizar.
              </p>
            )}
            {errors.slug && (
              <p className="text-xs text-destructive">{errors.slug.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" rows={3} {...register('description')} />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Categoría</Label>
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? NO_CATEGORY}
                  onValueChange={(v) => field.onChange(v === NO_CATEGORY ? null : v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sin categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_CATEGORY}>Sin categoría</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* SKU */}
          <div className="space-y-1.5">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              {...register('sku', {
                setValueAs: (v: string) => v === '' ? null : v,
              })}
            />
          </div>

          {/* Price + Compare price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="price">Precio *</Label>
              <Input
                id="price"
                type="number"
                step="1"
                min="0"
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="compare_at_price">Precio tachado</Label>
              <Input
                id="compare_at_price"
                type="number"
                step="1"
                min="0"
                {...register('compare_at_price', {
                  setValueAs: (v: string) =>
                    v === '' || v === null ? null : Number(v),
                })}
              />
            </div>
          </div>

          {/* Stock (create) + Threshold */}
          <div className="grid grid-cols-2 gap-3">
            {!isEdit && (
              <div className="space-y-1.5">
                <Label htmlFor="stock">Stock inicial</Label>
                <Input
                  id="stock"
                  type="number"
                  step="1"
                  min="0"
                  {...register('stock', { valueAsNumber: true })}
                />
                {errors.stock && (
                  <p className="text-xs text-destructive">{errors.stock.message}</p>
                )}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="stock_min_threshold">Umbral mínimo</Label>
              <Input
                id="stock_min_threshold"
                type="number"
                step="1"
                min="0"
                {...register('stock_min_threshold', { valueAsNumber: true })}
              />
            </div>
          </div>

          {isEdit && (
            <p className="text-xs text-muted-foreground">
              El stock se ajusta desde el módulo de{' '}
              <span className="font-medium">Stock</span>.
            </p>
          )}

          {/* Active + Featured */}
          <div className="flex items-center gap-6">
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="active" className="cursor-pointer">
                    Activo
                  </Label>
                </div>
              )}
            />
            <Controller
              name="featured"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="featured"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="featured" className="cursor-pointer">
                    Destacado
                  </Label>
                </div>
              )}
            />
          </div>

          {/* Image (edit only) */}
          {isEdit && (
            <>
              <Separator />
              <div className="space-y-1.5">
                <Label>Imagen del producto</Label>
                <ImageUploader
                  productId={product.id}
                  currentUrl={product.image_url}
                  onUploadComplete={() => router.refresh()}
                />
              </div>
            </>
          )}
        </form>
      </div>

      <SheetFooter className="border-t px-6 pb-6 pt-4">
        <SheetClose asChild>
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </SheetClose>
        <Button type="submit" form="product-form" disabled={isSubmitting}>
          {isSubmitting
            ? 'Guardando...'
            : isEdit
              ? 'Guardar cambios'
              : 'Crear producto'}
        </Button>
      </SheetFooter>
    </>
  )
}
