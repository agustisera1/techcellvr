import { EmptyState } from "@/components/shared/empty-state";
import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Lectura de `mockSettings` y formularios después.
        </p>
      </div>
      <EmptyState
        title="Pendiente de implementación"
        description="Horarios, nombre del negocio, envío, etc."
        icon={Settings}
      />
    </div>
  );
}
