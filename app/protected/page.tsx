import { redirect } from "next/navigation";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";

function formatDate(value: string | undefined) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("es");
  } catch {
    return value;
  }
}

function UserCardSkeleton() {
  return (
    <section
      className="rounded-lg border bg-card p-6 shadow-sm"
      aria-busy
      aria-label="Cargando datos de cuenta"
    >
      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="mt-4 grid gap-3 sm:grid-cols-[8rem_1fr] sm:gap-x-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="contents">
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            <div className="h-4 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </section>
  );
}

async function ProtectedUserContent() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  const metaEntries = Object.entries(user.user_metadata ?? {});
  const hasMeta = metaEntries.length > 0;

  return (
    <section
      className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm"
      aria-labelledby="user-block-title"
    >
      <h2
        id="user-block-title"
        className="text-sm font-medium text-muted-foreground"
      >
        Tu cuenta
      </h2>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-[8rem_1fr] sm:gap-x-4">
        <dt className="text-muted-foreground">Email</dt>
        <dd className="break-all font-medium">{user.email ?? "—"}</dd>

        <dt className="text-muted-foreground">ID</dt>
        <dd className="break-all font-mono text-xs">{user.id}</dd>

        <dt className="text-muted-foreground">Creada</dt>
        <dd>{formatDate(user.created_at)}</dd>

        <dt className="text-muted-foreground">Último acceso</dt>
        <dd>{formatDate(user.last_sign_in_at)}</dd>
      </dl>

      {hasMeta && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Metadatos de usuario
          </h3>
          <ul className="mt-2 space-y-1 text-sm">
            {metaEntries.map(([key, val]) => (
              <li key={key}>
                <span className="text-muted-foreground">{key}: </span>
                <span className="break-all">
                  {typeof val === "object"
                    ? JSON.stringify(val)
                    : String(val)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default function ProtectedPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Área protegida
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Datos de la sesión actual (Supabase Auth).
        </p>
      </div>

      <Suspense fallback={<UserCardSkeleton />}>
        <ProtectedUserContent />
      </Suspense>
    </div>
  );
}
