import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: { label: string; positive?: boolean };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardDescription>{title}</CardDescription>
          <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
        </div>
        {Icon && (
          <div className="rounded-md bg-muted p-2 text-muted-foreground">
            <Icon className="size-4" aria-hidden />
          </div>
        )}
      </CardHeader>
      {(description || trend) && (
        <CardContent className="text-xs text-muted-foreground">
          {trend && (
            <span
              className={cn(
                trend.positive === false && "text-destructive",
                trend.positive === true && "text-emerald-600 dark:text-emerald-400",
              )}
            >
              {trend.label}
            </span>
          )}
          {description && <p className={trend ? "mt-1" : undefined}>{description}</p>}
        </CardContent>
      )}
    </Card>
  );
}
