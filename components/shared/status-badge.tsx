import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus, PaymentStatus } from "@/lib/mocks/types";

const orderStatusLabel: Record<OrderStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "Preparando",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const orderStatusClass: Record<OrderStatus, string> = {
  pending:
    "border-transparent bg-amber-500/15 text-amber-800 dark:text-amber-200",
  confirmed:
    "border-transparent bg-blue-500/15 text-blue-800 dark:text-blue-200",
  preparing:
    "border-transparent bg-violet-500/15 text-violet-800 dark:text-violet-200",
  shipped:
    "border-transparent bg-indigo-500/15 text-indigo-800 dark:text-indigo-200",
  delivered:
    "border-transparent bg-emerald-500/15 text-emerald-800 dark:text-emerald-200",
  cancelled: "border-transparent bg-red-500/15 text-red-800 dark:text-red-200",
};

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-normal", orderStatusClass[status], className)}
    >
      {orderStatusLabel[status]}
    </Badge>
  );
}

const paymentStatusLabel: Record<PaymentStatus, string> = {
  pending: "Pago pendiente",
  paid: "Pagado",
  failed: "Fallido",
  refunded: "Reembolsado",
};

const paymentStatusClass: Record<PaymentStatus, string> = {
  pending:
    "border-transparent bg-amber-500/15 text-amber-800 dark:text-amber-200",
  paid: "border-transparent bg-emerald-500/15 text-emerald-800 dark:text-emerald-200",
  failed: "border-transparent bg-red-500/15 text-red-800 dark:text-red-200",
  refunded:
    "border-transparent bg-slate-500/15 text-slate-800 dark:text-slate-200",
};

export function PaymentStatusBadge({
  status,
  className,
}: {
  status: PaymentStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-normal", paymentStatusClass[status], className)}
    >
      {paymentStatusLabel[status]}
    </Badge>
  );
}
