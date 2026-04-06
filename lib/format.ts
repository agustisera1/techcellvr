import { format } from 'date-fns'

export function formatARS(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateTime(iso: string): string {
  try {
    // date-fns produces consistent output across Node.js and browser,
    // avoiding hydration mismatches caused by Intl locale differences.
    return format(new Date(iso), 'dd/MM/yy, HH:mm')
  } catch {
    return iso
  }
}
