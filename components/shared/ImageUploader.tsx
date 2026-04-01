'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ImageIcon, Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { updateProductImageAction } from '@/app/admin/products/actions'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageUploaderProps {
  productId: string
  currentUrl: string | null
  onUploadComplete?: () => void
  className?: string
}

const BUCKET = 'product-images'
const MAX_SIZE_MB = 5
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export function ImageUploader({
  productId,
  currentUrl,
  onUploadComplete,
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Formato no soportado. Usá JPG, PNG o WebP.')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`La imagen no puede superar ${MAX_SIZE_MB} MB.`)
      return
    }

    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${productId}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false, contentType: file.type })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)

      const result = await updateProductImageAction(productId, publicUrl)
      if (!result.success) throw new Error(result.error)

      setPreview(publicUrl)
      toast.success('Imagen actualizada')
      onUploadComplete?.()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className={cn('space-y-3', className)}>
      {preview ? (
        <div className="relative h-40 w-40 overflow-hidden rounded-lg border bg-muted">
          <Image src={preview} alt="Imagen del producto" fill className="object-cover" />
        </div>
      ) : null}

      <div
        role="button"
        tabIndex={0}
        aria-label="Subir imagen"
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !uploading && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors',
          dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          uploading && 'pointer-events-none opacity-60',
        )}
      >
        {uploading ? (
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        ) : (
          <Upload className="size-6 text-muted-foreground" />
        )}
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {uploading ? 'Subiendo...' : preview ? 'Cambiar imagen' : 'Subir imagen'}
          </p>
          <p className="text-xs text-muted-foreground">JPG, PNG, WebP · máx. {MAX_SIZE_MB} MB</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={onInputChange}
        className="hidden"
      />

      {!preview && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <ImageIcon className="mr-2 size-4" />
          Seleccionar archivo
        </Button>
      )}
    </div>
  )
}
