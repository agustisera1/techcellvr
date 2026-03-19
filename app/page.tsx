import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { hasEnvVars } from "@/lib/utils";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Techcell</h1>
          <p className="mt-2 text-muted-foreground">
            Sesión con Supabase. El área protegida muestra los datos de tu
            cuenta.
          </p>
          {hasEnvVars ? (
            <Button asChild className="mt-6">
              <Link href="/protected">Área protegida</Link>
            </Button>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              Configura las variables de entorno de Supabase en{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                .env.local
              </code>{" "}
              para habilitar el inicio de sesión.
            </p>
          )}
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
