import { EmptyState } from "@/components/shared/empty-state";
import { ShoppingCart } from "lucide-react";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pedidos</h1>
        <p className="text-sm text-muted-foreground">
          Siguiente: OrdersTable, OrderDetailDrawer (mocks).
        </p>
      </div>
      <EmptyState
        title="Pendiente de implementación"
        description="Aquí irá la tabla de pedidos con datos mock."
        icon={ShoppingCart}
      />
    </div>
  );
}
