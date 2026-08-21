"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  Heart,
  LogOut,
  Menu,
  MessageCircle,
  Plus,
  Store,
  UserRound,
  X,
} from "lucide-react";

import { CategoryNav } from "@/components/layout/category-nav";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { MarketliftLogo } from "@/components/marketplace/logo";
import { LocationSelector } from "@/components/marketplace/location-selector";
import { SearchBar } from "@/components/search/search-bar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { socialService } from "@/services/social.service";
import { useAuth } from "@/providers/auth-provider";
import { useLocale } from "@/providers/locale-provider";
import { useRealtime } from "@/providers/realtime-provider";
import type { Location } from "@/types";

export function MarketplaceHeader() {
  const pathname = usePathname();
  const { t } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [location, setLocation] = useState<Location>({
    state: "São Paulo",
    stateCode: "SP",
    city: "São Paulo",
  });

  const { user, hydrated, isAuthenticated, canSell, logout } = useAuth();
  const { unreadMessageCount, unreadNotificationCount } = useRealtime();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  // This gate belongs to the header itself so its first client render always
  // matches the server HTML, even when the parent tree is streamed by Suspense.
  const authReady = mounted && hydrated;

  const savedIdsQuery = useQuery({
    queryKey: ["saved-listing-ids"],
    queryFn: socialService.getSavedIds,
    enabled: authReady && isAuthenticated,
    staleTime: 60_000,
  });

  const savedCount = savedIdsQuery.data?.length ?? 0;

  const privateWorkspace =
    pathname.startsWith("/selling") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/messages") ||
    pathname.startsWith("/notifications");

  const sellHref = !isAuthenticated
    ? "/login?returnTo=%2Fselling%2Fstart"
    : canSell
      ? "/selling/listings/new"
      : "/selling/start";

  const initials =
    user?.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  function signOut() {
    logout();
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/95 text-white shadow-[0_8px_30px_rgba(2,18,47,0.12)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:px-6 lg:gap-4 lg:px-8">
        <MarketliftLogo size="compact" priority />

        <div className="hidden min-w-0 flex-1 lg:block">
          <SearchBar compact location={location} showSubmitButton={false} />
        </div>

        <LanguageSwitcher inverse className="hidden lg:inline-flex" />

        <div className="hidden md:block">
          <LocationSelector
            value={location}
            onChange={setLocation}
            compact
            inverse
          />
        </div>

        <nav
          className="ml-auto flex items-center gap-1"
          aria-label={t("nav.account")}
        >
          <LanguageSwitcher compact inverse className="lg:hidden" />

          {authReady && user && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="relative hidden text-white hover:bg-white/10 hover:text-white xl:inline-flex"
                asChild
              >
                <Link
                  href="/account/saved"
                  aria-label={`${t("nav.saved")}: ${savedCount}`}
                >
                  <Heart className="size-5" aria-hidden="true" />

                  {savedCount > 0 && (
                    <span
                      className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-lift-500 px-1.5 text-[10px] font-black leading-5 text-ink-950 shadow-sm ring-2 ring-ink-950"
                      aria-hidden="true"
                    >
                      {savedCount > 99 ? "99+" : savedCount}
                    </span>
                  )}
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="relative hidden text-white hover:bg-white/10 hover:text-white xl:inline-flex"
                asChild
              >
                <Link
                  href="/messages"
                  aria-label={`${t("nav.messages")}: ${unreadMessageCount}`}
                >
                  <MessageCircle className="size-5" aria-hidden="true" />
                  {unreadMessageCount > 0 && (
                    <span
                      className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-lift-500 px-1.5 text-[10px] font-black leading-5 text-ink-950 shadow-sm ring-2 ring-ink-950"
                      aria-hidden="true"
                    >
                      {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                    </span>
                  )}
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="relative hidden text-white hover:bg-white/10 hover:text-white xl:inline-flex"
                asChild
              >
                <Link
                  href="/notifications"
                  aria-label={`${t("nav.notifications")}: ${unreadNotificationCount}`}
                >
                  <Bell className="size-5" aria-hidden="true" />
                  {unreadNotificationCount > 0 && (
                    <span
                      className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-lift-500 px-1.5 text-[10px] font-black leading-5 text-ink-950 shadow-sm ring-2 ring-ink-950"
                      aria-hidden="true"
                    >
                      {unreadNotificationCount > 99
                        ? "99+"
                        : unreadNotificationCount}
                    </span>
                  )}
                </Link>
              </Button>
            </>
          )}

          {authReady && !user && (
            <>
              <Button
                variant="ghost"
                className="hidden text-white hover:bg-white/10 hover:text-white sm:inline-flex"
                asChild
              >
                <Link href="/login">{t("nav.login")}</Link>
              </Button>

              <Button
                variant="outline"
                className="hidden border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white lg:inline-flex"
                asChild
              >
                <Link href="/register">{t("nav.register")}</Link>
              </Button>
            </>
          )}

          {authReady && (
            <Button
              asChild
              className="hidden bg-lift-500 font-extrabold text-ink-950 shadow-md shadow-orange-950/10 hover:bg-lift-400 sm:inline-flex"
            >
              <Link href={sellHref}>
                <Plus className="size-4" aria-hidden="true" />
                {t("nav.sell")}
              </Link>
            </Button>
          )}

          {authReady && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="hidden size-11 place-items-center rounded-full bg-brand-500 text-sm font-black text-white shadow-sm ring-2 ring-white/15 transition hover:bg-brand-400 focus-visible:ring-2 focus-visible:ring-white sm:grid"
                  aria-label={`${t("nav.myAccount")}: ${user.name}`}
                >
                  {initials}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <p className="truncate text-sm font-black">{user.name}</p>
                  <p className="mt-0.5 text-xs font-normal text-slate-500">
                    {t("nav.accountName")}
                  </p>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/account" className="cursor-pointer">
                    <UserRound className="size-4" aria-hidden="true" />
                    {t("nav.myAccount")}
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href={canSell ? "/selling" : "/selling/start"}
                    className="cursor-pointer"
                  >
                    <Store className="size-4" aria-hidden="true" />
                    {canSell ? t("nav.selling") : t("nav.startSelling")}
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onSelect={signOut}
                  className="cursor-pointer text-rose-700 focus:bg-rose-50 focus:text-rose-800"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  {t("nav.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 hover:text-white sm:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label={t("nav.openMenu")}
            aria-expanded={menuOpen}
          >
            <Menu className="size-6" aria-hidden="true" />
          </Button>
        </nav>
      </div>

      {!privateWorkspace && (
        <div className="space-y-2 px-3 pb-3 sm:px-6 lg:hidden">
          <div className="flex min-w-0 items-center justify-between gap-2 md:hidden">
            <LocationSelector
              value={location}
              onChange={setLocation}
              compact
              inverse
            />

            <span className="truncate text-xs text-slate-300">
              {t("nav.dealsNear", { city: location.city })}
            </span>
          </div>

          <SearchBar compact location={location} showSubmitButton={false} />
        </div>
      )}

      {!privateWorkspace && <CategoryNav />}

      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent
          showCloseButton={false}
          className="top-auto bottom-0 left-0 max-h-[88dvh] w-full max-w-none translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-b-none rounded-t-3xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:hidden"
        >
          <div className="flex items-center justify-between gap-4">
            <MarketliftLogo size="compact" />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(false)}
              aria-label={t("nav.closeMenu")}
            >
              <X className="size-5" aria-hidden="true" />
            </Button>
          </div>

          <DialogTitle className="sr-only">{t("nav.openMenu")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("nav.browseMarketplace")}
          </DialogDescription>

          {user ? (
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
              <span className="grid size-11 place-items-center rounded-full bg-brand-600 text-sm font-black text-white">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-black">{user.name}</p>
                <p className="text-xs text-slate-500">{t("nav.accountName")}</p>
              </div>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button variant="outline" asChild>
                <Link href="/login" onClick={() => setMenuOpen(false)}>
                  {t("nav.login")}
                </Link>
              </Button>
              <Button asChild>
                <Link href="/register" onClick={() => setMenuOpen(false)}>
                  {t("nav.register")}
                </Link>
              </Button>
            </div>
          )}

          <div className="mt-4 rounded-2xl bg-slate-50 p-2">
            <LocationSelector value={location} onChange={setLocation} />
          </div>

          <nav
            className="mt-5 grid grid-cols-2 gap-2"
            aria-label={t("nav.openMenu")}
          >
            <Link
              href="/search"
              onClick={() => setMenuOpen(false)}
              className="min-h-20 rounded-2xl border p-4 text-sm font-bold text-slate-700 focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              {t("nav.browseMarketplace")}
            </Link>

            {user && (
              <Link
                href="/account/saved"
                onClick={() => setMenuOpen(false)}
                className="flex min-h-20 items-start justify-between gap-3 rounded-2xl border p-4 text-sm font-bold text-slate-700 focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                <span>{t("nav.saved")}</span>

                {savedCount > 0 && (
                  <span className="grid min-w-6 place-items-center rounded-full bg-lift-500 px-2 text-[11px] font-black leading-6 text-ink-950">
                    {savedCount > 99 ? "99+" : savedCount}
                  </span>
                )}
              </Link>
            )}

            {user && (
              <Link
                href="/messages"
                onClick={() => setMenuOpen(false)}
                className="min-h-20 rounded-2xl border p-4 text-sm font-bold text-slate-700 focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                {t("nav.messages")}
                {unreadMessageCount > 0
                  ? ` (${unreadMessageCount > 99 ? "99+" : unreadMessageCount})`
                  : ""}
              </Link>
            )}

            {user && (
              <Link
                href="/notifications"
                onClick={() => setMenuOpen(false)}
                className="min-h-20 rounded-2xl border p-4 text-sm font-bold text-slate-700 focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                {t("nav.notifications")}
                {unreadNotificationCount > 0
                  ? ` (${unreadNotificationCount > 99 ? "99+" : unreadNotificationCount})`
                  : ""}
              </Link>
            )}

            {user && (
              <Link
                href={canSell ? "/selling" : "/selling/start"}
                onClick={() => setMenuOpen(false)}
                className="min-h-20 rounded-2xl border p-4 text-sm font-bold text-slate-700 focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                {canSell ? t("nav.selling") : t("nav.startSelling")}
              </Link>
            )}
          </nav>

          <Button
            className="mt-4 w-full bg-lift-500 font-extrabold text-ink-950 hover:bg-lift-400"
            asChild
          >
            <Link href={sellHref} onClick={() => setMenuOpen(false)}>
              <Plus className="size-4" aria-hidden="true" />
              {t("nav.sell")}
            </Link>
          </Button>

          {user && (
            <Button
              variant="ghost"
              className="mt-2 w-full text-rose-700 hover:bg-rose-50 hover:text-rose-800"
              onClick={signOut}
            >
              <LogOut className="size-4" aria-hidden="true" />
              {t("nav.signOut")}
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </header>
  );
}
