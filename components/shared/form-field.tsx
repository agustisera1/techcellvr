import { cn } from '@/lib/utils'

interface FormFieldProps {
  children: React.ReactNode
  error?: string
  hint?: string
  className?: string
}

/**
 * Wrapper uniforme para campos de formulario.
 * Garantiza altura consistente en todos los campos via el slot fijo de mensaje,
 * evitando layout shift al aparecer errores o hints.
 */
export function FormField({ children, error, hint, className }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {children}
      <div className="min-h-[1rem]">
        {error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    </div>
  )
}
