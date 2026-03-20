import { EmptyState } from "@/components/shared/empty-state";
import { BarChart3 } from "lucide-react";

export default function AdminReportsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reportes</h1>
        <p className="text-sm text-muted-foreground">
          v2: SalesChart y StockMovementsLog ampliados.
        </p>
      </div>
      <EmptyState
        title="Pendiente de implementación"
        description="Gráficos y exportación cuando definamos el alcance."
        icon={BarChart3}
      />
    </div>
  );
}
