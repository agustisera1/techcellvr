"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const routeTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Productos",
  "/admin/orders": "Pedidos",
  "/admin/stock": "Stock",
  "/admin/reports": "Reportes",
  "/admin/settings": "Configuración",
};

function breadcrumbFromPath(pathname: string): { href: string; label: string }[] {
  const segments = pathname.split("/").filter(Boolean);
  const items: { href: string; label: string }[] = [];
  let acc = "";
  for (const seg of segments) {
    acc += `/${seg}`;
    const label =
      routeTitles[acc] ??
      seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
    items.push({ href: acc, label });
  }
  return items.length ? items : [{ href: "/admin", label: "Dashboard" }];
}

interface AdminNavbarProps {
  businessName: string;
  userLabel?: string;
  onLogout?: () => void;
  className?: string;
}

export function AdminNavbar({
  businessName,
  userLabel = "Administrador",
  onLogout,
  className,
}: AdminNavbarProps) {
  const pathname = usePathname() ?? "/admin";
  const crumbs = breadcrumbFromPath(pathname);

  return (
    <header
      className={cn(
        "flex h-14 items-center justify-between gap-4 border-b bg-background px-4 lg:px-6",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{businessName}</p>
        <nav
          className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-muted-foreground"
          aria-label="Migas de pan"
        >
          {crumbs.map((c, i) => (
            <span key={c.href} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight className="size-3 opacity-60" aria-hidden />
              )}
              {i === crumbs.length - 1 ? (
                <span className="text-foreground">{c.label}</span>
              ) : (
                <Link
                  href={c.href}
                  className="hover:text-foreground hover:underline"
                >
                  {c.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            aria-label="Menú de usuario"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
              {userLabel.slice(0, 2).toUpperCase()}
            </span>
            <span className="hidden max-w-[10rem] truncate sm:inline">
              {userLabel}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="font-normal">
            {userLabel}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2"
            onSelect={() => onLogout?.()}
            disabled={!onLogout}
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
