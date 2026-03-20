"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Package, ShoppingCart, AlertTriangle } from "lucide-react";

import { StatsCard } from "@/components/admin/dashboard/stats-card";
import { DataTable } from "@/components/shared/data-table";
import { OrderStatusBadge } from "@/components/shared/status-badge";
import { formatARS, formatDateTime } from "@/lib/format";
import {
  getLowStockProducts,
  mockCustomers,
  mockOrders,
} from "@/lib/mocks/data";
import type { MockOrder } from "@/lib/mocks/types";

function customerName(id: string): string {
  return mockCustomers.find((c) => c.id === id)?.name ?? "—";
}

const columns: ColumnDef<MockOrder>[] = [
  {
    accessorKey: "created_at",
    header: "Fecha",
    cell: ({ row }) => formatDateTime(row.original.created_at),
  },
  {
    id: "customer",
    header: "Cliente",
    cell: ({ row }) => customerName(row.original.customer_id),
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => formatARS(row.original.total),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
  },
];

export function DashboardOverview() {
  const pending = mockOrders.filter((o) => o.status === "pending").length;
  const lowStock = getLowStockProducts().length;
  const totalPedidosMock = mockOrders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Vista previa con datos mock — los servicios se conectarán después.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Pedidos pendientes"
          value={pending}
          icon={ShoppingCart}
          description="Requieren acción"
        />
        <StatsCard
          title="Total en pedidos (mock)"
          value={formatARS(totalPedidosMock)}
          icon={Package}
          description="Suma de los pedidos de ejemplo"
        />
        <StatsCard
          title="Stock bajo"
          value={lowStock}
          icon={AlertTriangle}
          trend={{
            label: "Umbral mínimo",
            positive: lowStock === 0,
          }}
        />
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Pedidos recientes (mock)</h2>
        <DataTable columns={columns} data={mockOrders} pageSize={5} />
      </section>
    </div>
  );
}
