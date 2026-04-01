'use client'

import { useEffect } from 'react'
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
import { FormField as Field } from '@/components/shared/form-field'
import { z } from 'zod'
import { createProductSchema } from '@/lib/validations/products'
import { generateSlug } from '@/lib/utils/slug'
import { createProductAction, updateProductAction } from '@/app/admin/products/actions'
import type { CategoryOption } from '@/lib/categories-service'
import type { ProductWithCategory } from '@/lib/products-service'

type ProductFormValues = z.input<typeof createProductSchema>

const NO_CATEGORY = '__none__'

interface ProductFormProps {
  product?: ProductWithCategory
  categories: CategoryOption[]
  onClose: () => void
}


export function ProductForm({ product, categories, onClose }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!product

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
    if (!isEdit && nameValue) {
      setValue('slug', generateSlug(nameValue), { shouldValidate: false })
    }
  }, [nameValue, isEdit, setValue])

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
        <SheetTitle className="text-xl">
          {isEdit ? 'Editar producto' : 'Nuevo producto'}
        </SheetTitle>
        {!isEdit && (
          <p className="text-sm text-muted-foreground">
            Completá los datos del producto. Podés agregar la imagen una vez creado.
          </p>
        )}
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Nombre */}
          <Field error={errors.name?.message}>
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" placeholder="Ej: iPhone 15 Pro 256GB" {...register('name')} />
          </Field>

          {/* Categoría */}
          <Field>
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
          </Field>

          {/* Precio + Precio tachado */}
          <div className="grid grid-cols-2 gap-4">
            <Field error={errors.price?.message}>
              <Label htmlFor="price">Precio *</Label>
              <Input
                id="price"
                type="number"
                step="1"
                min="0"
                placeholder="0"
                {...register('price', { valueAsNumber: true })}
              />
            </Field>
            <Field hint="Precio original para mostrar tachado.">
              <Label htmlFor="compare_at_price">Precio tachado</Label>
              <Input
                id="compare_at_price"
                type="number"
                step="1"
                min="0"
                placeholder="0"
                {...register('compare_at_price', {
                  setValueAs: (v: string) => (v === '' || v === null ? null : Number(v)),
                })}
              />
            </Field>
          </div>

          {/* Stock inicial — solo en creación */}
          {!isEdit && (
            <Field
              error={errors.stock?.message}
              hint="Unidades disponibles al crear el producto."
            >
              <Label htmlFor="stock">Stock inicial</Label>
              <Input
                id="stock"
                type="number"
                step="1"
                min="0"
                placeholder="0"
                {...register('stock', { valueAsNumber: true })}
              />
            </Field>
          )}

          {/* Umbral mínimo + Slug */}
          <div className="grid grid-cols-2 gap-4">
            <Field hint={isEdit ? 'El stock se ajusta desde el módulo de Stock.' : 'Alerta cuando el stock baje de este valor.'}>
              <Label htmlFor="stock_min_threshold">Umbral mínimo</Label>
              <Input
                id="stock_min_threshold"
                type="number"
                step="1"
                min="0"
                placeholder="0"
                {...register('stock_min_threshold', { valueAsNumber: true })}
              />
            </Field>
            <Field
              hint="Generado desde el nombre · se usa en la URL del producto."
              error={errors.slug?.message}
            >
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                disabled
                className="disabled:cursor-default disabled:opacity-60"
                {...register('slug')}
              />
            </Field>
          </div>

          {/* Descripción */}
          <Field>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Describí el producto: características, compatibilidades, etc."
              {...register('description')}
            />
          </Field>

          {/* Activo + Destacado */}
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-1.5">
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
                  <p className="text-xs text-muted-foreground">
                    Solo los activos son visibles en el catálogo.
                  </p>
                </div>
              )}
            />
            <Controller
              name="featured"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-1.5">
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
                  <p className="text-xs text-muted-foreground">
                    Aparece en la sección principal del catálogo.
                  </p>
                </div>
              )}
            />
          </div>

          {/* Imagen — solo en edición */}
          {isEdit && (
            <>
              <Separator />
              <Field>
                <Label>Imagen del producto</Label>
                <ImageUploader
                  productId={product.id}
                  currentUrl={product.image_url}
                  onUploadComplete={() => router.refresh()}
                />
              </Field>
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
          {isSubmitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </SheetFooter>
    </>
  )
}
