import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StockAlertBannerProps {
  lowStockCount: number;
  stockHref?: string;
  className?: string;
}

export function StockAlertBanner({
  lowStockCount,
  stockHref = "/admin/stock",
  className,
}: StockAlertBannerProps) {
  if (lowStockCount <= 0) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-950 dark:text-amber-100",
        className,
      )}
      role="status"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-4 shrink-0" aria-hidden />
        <span>
          Hay{" "}
          <strong>
            {lowStockCount} producto{lowStockCount === 1 ? "" : "s"}
          </strong>{" "}
          con stock por debajo del umbral mínimo.
        </span>
      </div>
      <Button asChild size="sm" variant="outline" className="border-amber-600/40">
        <Link href={stockHref}>Ver stock</Link>
      </Button>
    </div>
  );
}
