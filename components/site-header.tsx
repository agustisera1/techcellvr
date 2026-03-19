import Link from "next/link";
import { Suspense } from "react";

import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="w-full border-b border-border/40">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5 text-sm">
        <Link href="/" className="font-semibold">
          Techcell
        </Link>
        {!hasEnvVars ? (
          <EnvVarWarning />
        ) : (
          <Suspense
            fallback={
              <span className="text-muted-foreground text-sm">Cargando…</span>
            }
          >
            <AuthButton />
          </Suspense>
        )}
      </div>
    </header>
  );
}
