"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/providers/auth-provider";
import { useLocale } from "@/providers/locale-provider";

function requiresAuthentication(pathname: string) {
  return (
    pathname.startsWith("/account") ||
    pathname.startsWith("/messages") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/selling")
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
    >
      <span className="sr-only">{t("access.checking")}</span>
      <div className="mx-auto max-w-lg animate-pulse space-y-4">
        <div className="mx-auto h-16 w-44 rounded-2xl bg-slate-200" />
        <div className="h-72 rounded-3xl bg-white shadow-sm" />
      </div>
    </div>
  );
}

export function AccessController({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { hydrated, isAuthenticated, canSell } = useAuth();
  const [mounted, setMounted] = useState(false);

  const authRequired = requiresAuthentication(pathname);
  const authReady = mounted && hydrated;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!authRequired || !authReady) return;

    if (!isAuthenticated) {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
      return;
    }

    if (requiresSellingCapability(pathname) && !canSell) {
      router.replace(`/selling/start?returnTo=${encodeURIComponent(pathname)}`);
    }
  }, [
    authReady,
    authRequired,
    canSell,
    isAuthenticated,
    pathname,
    router,
  ]);

  if (!authRequired) return <>{children}</>;
  if (!authReady) return <AccessLoading />;

  // Never show an intermediary auth/signup card. While the client router
  // performs the redirect, retain only the neutral loading state.
  if (!isAuthenticated) return <AccessLoading />;

  if (requiresSellingCapability(pathname) && !canSell) {
    return <AccessLoading />;
  }

  return <>{children}</>;
}
