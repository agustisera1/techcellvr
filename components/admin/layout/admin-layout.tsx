import { StockAlertBanner } from "@/components/admin/layout/stock-alert-banner";
import { AdminNavbar } from "@/components/admin/layout/admin-navbar";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { getLowStockCount } from "@/lib/stock-service";

// Business name remains mock until feature/admin-settings connects the settings table.
const BUSINESS_NAME = "Techcell";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export async function AdminLayout({ children }: AdminLayoutProps) {
  const lowStockCount = await getLowStockCount().catch(() => 0);

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <AdminSidebar businessName={BUSINESS_NAME} />
      <div className="flex min-w-0 flex-1 flex-col">
        <StockAlertBanner lowStockCount={lowStockCount} />
        <AdminNavbar businessName={BUSINESS_NAME} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
