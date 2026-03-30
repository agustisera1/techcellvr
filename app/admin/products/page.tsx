import { EmptyState } from "@/components/shared/empty-state";
import { Package } from "lucide-react";

export default function AdminProductsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
        <p className="text-sm text-muted-foreground">
          Siguiente: ProductsTable, ProductForm, filtros (mocks).
        </p>
      </div>
      <EmptyState
        title="Pendiente de implementación"
        description="Aquí irá la tabla de productos con datos mock."
        icon={Package}
      />
    </div>
  );
}
