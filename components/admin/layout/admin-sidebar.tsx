"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Boxes,
  BarChart3,
  Settings,
  Menu,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/stock", label: "Stock", icon: Boxes },
  { href: "/admin/reports", label: "Reportes", icon: BarChart3 },
  { href: "/admin/settings", label: "Configuración", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() ?? "/admin";

  return (
    <nav className="flex flex-col gap-1 p-2" aria-label="Principal">
      {nav.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/admin"
            ? pathname === "/admin"
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

interface AdminSidebarProps {
  businessName: string;
  className?: string;
}

export function AdminSidebar({ businessName, className }: AdminSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside
        className={cn(
          "hidden w-56 shrink-0 border-r bg-muted/30 lg:flex lg:flex-col",
          className,
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <span className="truncate text-sm font-semibold">{businessName}</span>
        </div>
        <NavLinks />
      </aside>

      <div className="flex h-14 items-center border-b px-4 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Abrir menú">
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="flex h-14 items-center border-b px-4">
              <span className="truncate text-sm font-semibold">
                {businessName}
              </span>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <span className="ml-3 truncate text-sm font-semibold">{businessName}</span>
      </div>
    </>
  );
}
