import { EmptyState } from "@/components/shared/empty-state";
import { Boxes } from "lucide-react";

export default function AdminStockPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Stock</h1>
        <p className="text-sm text-muted-foreground">
          Siguiente: LowStockTable, StockAdjustForm, movimientos (mocks).
        </p>
      </div>
      <EmptyState
        title="Pendiente de implementación"
        description="Vista de stock bajo y ajustes manuales."
        icon={Boxes}
      />
    </div>
  );
}
