import { StockAlertBanner } from "@/components/admin/layout/stock-alert-banner";
import { AdminNavbar } from "@/components/admin/layout/admin-navbar";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { getLowStockProducts, mockSettings } from "@/lib/mocks/data";

function settingValue(key: string, fallback: string) {
  return mockSettings.find((s) => s.key === key)?.value ?? fallback;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout del panel admin. Datos de negocio mock desde `lib/mocks` hasta conectar servicios.
 */
export function AdminLayout({ children }: AdminLayoutProps) {
  const businessName = settingValue("business_name", "Techcell");
  const lowStock = getLowStockProducts().length;

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <AdminSidebar businessName={businessName} />
      <div className="flex min-w-0 flex-1 flex-col">
        <StockAlertBanner lowStockCount={lowStock} />
        <AdminNavbar businessName={businessName} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
