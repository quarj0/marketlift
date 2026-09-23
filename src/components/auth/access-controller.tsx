"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { resolveApiUrl } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";
import { useLocale } from "@/providers/locale-provider";

function requiresAuthentication(pathname: string) {
  return (
    pathname.startsWith("/account") ||
    pathname.startsWith("/messages") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/selling") ||
    pathname.startsWith("/checkout")
  );
}

function requiresSellingCapability(pathname: string) {
  if (!pathname.startsWith("/selling")) return false;
  return pathname !== "/selling/start" && !pathname.startsWith("/selling/start/");
}

function AccessLoading() {
  const { t } = useLocale();

  return (
    <div
      className="min-h-screen bg-slate-50 px-4 py-12"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">{t("access.checking")}</span>
      <div className="mx-auto max-w-lg animate-pulse space-y-4">
        <div className="mx-auto h-16 w-44 rounded-2xl bg-slate-200" />
        <div className="h-72 rounded-3xl bg-white shadow-sm" />
      </div>
    </div>
  );
}

function MaintenanceScreen({
  onRetry,
  checking,
}: {
  onRetry: () => void;
  checking: boolean;
}) {
  const { locale } = useLocale();
  const pt = locale === "pt-BR";

  return (
    <main
      className="grid min-h-screen place-items-center bg-slate-100 px-4 py-10 text-slate-900"
      role="alert"
      aria-live="assertive"
    >
      <section className="w-full max-w-lg rounded-lg border border-slate-300 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-700">
            <TriangleAlert className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              {pt ? "Manutenção em andamento" : "Maintenance in progress"}
            </p>
            <h1 className="mt-1 text-xl font-bold leading-tight text-slate-950">
              {pt
                ? "Marketplace temporariamente indisponível"
                : "Marketplace temporarily unavailable"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {pt
                ? "Estamos realizando uma manutenção programada. Esta é uma interrupção temporária do serviço e não há problema com sua conta ou dispositivo. Tente novamente em alguns minutos."
                : "We’re carrying out scheduled maintenance. This is a temporary service interruption, not a problem with your account or device. Please try again in a few minutes."}
            </p>
          </div>
        </div>

        <div className="mt-5 border-t border-slate-200 pt-4">
          <Button
            variant="outline"
            disabled={checking}
            onClick={onRetry}
          >
            <RefreshCw className={`size-4 ${checking ? "animate-spin" : ""}`} />
            {pt ? "Tentar novamente" : "Try again"}
          </Button>
        </div>
      </section>
    </main>
  );
}

export function AccessController({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { hydrated, isAuthenticated, canSell } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [maintenance, setMaintenance] = useState<boolean | null>(null);
  const [checkingMaintenance, setCheckingMaintenance] = useState(false);

  const authRequired = requiresAuthentication(pathname);
  const authReady = mounted && hydrated;

  const checkMaintenance = useCallback(async (interactive = false) => {
    if (interactive) setCheckingMaintenance(true);
    try {
      const response = await fetch(resolveApiUrl("/api/v1/health/maintenance/"), {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
        credentials: "omit",
        signal: AbortSignal.timeout(5_000),
      });
      if (!response.ok) throw new Error("Maintenance status unavailable");
      const payload = (await response.json()) as { maintenance?: boolean };
      setMaintenance(Boolean(payload.maintenance));
    } catch {
      // Fail open only before we have any confirmed state. Once maintenance is
      // known to be active, a transient probe failure must not expose broken
      // marketplace screens until a later successful probe confirms recovery.
      setMaintenance((current) => (current === null ? false : current));
    } finally {
      if (interactive) setCheckingMaintenance(false);
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    const timeout = window.setTimeout(() => void checkMaintenance(), 0);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [checkMaintenance]);

  useEffect(() => {
    const interval = window.setInterval(
      () => void checkMaintenance(),
      maintenance ? 15_000 : 60_000,
    );
    return () => window.clearInterval(interval);
  }, [checkMaintenance, maintenance]);

  useEffect(() => {
    if (!authRequired || !authReady || maintenance) return;

    if (!isAuthenticated) {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
      return;
    }

    if (requiresSellingCapability(pathname) && !canSell) {
      router.replace(`/selling/start?returnTo=${encodeURIComponent(pathname)}`);
    }
  }, [authReady, authRequired, canSell, isAuthenticated, maintenance, pathname, router]);

  if (maintenance) {
    return <MaintenanceScreen onRetry={() => void checkMaintenance(true)} checking={checkingMaintenance} />;
  }

  // Public pages keep their server-rendered content while the maintenance
  // status is still being probed. This preserves SEO/no-JS behavior and avoids
  // replacing the entire public marketplace with a client-only loading shell.
  if (!authRequired) return <>{children}</>;

  if (maintenance === null) return <AccessLoading />;
  if (!authReady) return <AccessLoading />;
  if (!isAuthenticated) return <AccessLoading />;
  if (requiresSellingCapability(pathname) && !canSell) return <AccessLoading />;

  return <>{children}</>;
}
