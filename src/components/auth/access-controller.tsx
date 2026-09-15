"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Wrench } from "lucide-react";
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

function MaintenanceScreen({ onRetry, checking }: { onRetry: () => void; checking: boolean }) {
  const { locale } = useLocale();
  const pt = locale === "pt-BR";

  return (
    <main className="grid min-h-screen place-items-center bg-[#02122f] px-4 py-12 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.06] p-7 text-center shadow-2xl backdrop-blur sm:p-10">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-amber-400/15 text-amber-300">
          <Wrench className="size-8" aria-hidden="true" />
        </div>
        <p className="mt-6 text-sm font-black uppercase tracking-[0.22em] text-sky-300">Marketlift</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          {pt ? "Estamos fazendo uma manutenção rápida" : "We’re making a quick improvement"}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-300 sm:text-base">
          {pt
            ? "O marketplace está temporariamente indisponível enquanto concluímos uma atualização. Seus dados e sua conta permanecem seguros. Tente novamente em alguns minutos."
            : "The marketplace is temporarily unavailable while we finish an update. Your account and data remain safe. Please try again in a few minutes."}
        </p>
        <Button
          className="mt-7 bg-white text-slate-950 hover:bg-slate-100"
          disabled={checking}
          onClick={onRetry}
        >
          <RefreshCw className={`size-4 ${checking ? "animate-spin" : ""}`} />
          {pt ? "Verificar novamente" : "Check again"}
        </Button>
        <p className="mt-5 text-xs text-slate-400">
          {pt
            ? "Administradores ainda podem acessar o console para concluir a manutenção."
            : "Administrators can still access the console to complete maintenance."}
        </p>
      </div>
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
