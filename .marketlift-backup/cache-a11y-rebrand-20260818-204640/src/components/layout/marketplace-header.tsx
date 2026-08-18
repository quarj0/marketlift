"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { useAuth } from "@/providers/auth-provider";
import { useLocale } from "@/providers/locale-provider";
import type { Location } from "@/types";

export function MarketplaceHeader() {
  const pathname = usePathname();
  const { t } = useLocale();

  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [location, setLocation] = useState<Location>({
    state: "São Paulo",
    stateCode: "SP",
    city: "São Paulo",
  });

  const {
    user,
    hydrated,
    isAuthenticated,
    canSell,
    logout,
  } = useAuth();

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
    setAccountOpen(false);
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:px-6 lg:gap-4 lg:px-8">
        <MarketliftLogo size="compact" priority />

        <div className="hidden min-w-0 flex-1 lg:block">
          <SearchBar
            compact
            location={location}
            showSubmitButton={false}
          />
        </div>

        <LanguageSwitcher className="hidden lg:inline-flex" />

        <div className="hidden md:block">
          <LocationSelector
            value={location}
            onChange={setLocation}
            compact
          />
        </div>

        <nav
          className="ml-auto flex items-center gap-1"
          aria-label={t("nav.account")}
        >
          <LanguageSwitcher
            compact
            className="lg:hidden"
          />
          {hydrated && user && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="hidden xl:inline-flex"
                asChild
              >
                <Link
                  href="/account/saved"
                  aria-label={t("nav.saved")}
                >
                  <Heart className="size-5" />
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="hidden xl:inline-flex"
                asChild
              >
                <Link
                  href="/messages"
                  aria-label={t("nav.messages")}
                >
                  <MessageCircle className="size-5" />
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="hidden xl:inline-flex"
                asChild
              >
                <Link
                  href="/notifications"
                  aria-label={t("nav.notifications")}
                >
                  <Bell className="size-5" />
                </Link>
              </Button>
            </>
          )}

          {hydrated && !user && (
            <>
              <Button
                variant="ghost"
                className="hidden sm:inline-flex"
                asChild
              >
                <Link href="/login">
                  {t("nav.login")}
                </Link>
              </Button>

              <Button
                variant="outline"
                className="hidden lg:inline-flex"
                asChild
              >
                <Link href="/register">
                  {t("nav.register")}
                </Link>
              </Button>
            </>
          )}

          {hydrated && (
            <Button
              asChild
              className="hidden sm:inline-flex"
            >
              <Link href={sellHref}>
                <Plus className="size-4" />
                {t("nav.sell")}
              </Link>
            </Button>
          )}

          {hydrated && user && (
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() =>
                  setAccountOpen((value) => !value)
                }
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                className="grid size-11 place-items-center rounded-full bg-brand-800 text-sm font-black text-white shadow-sm ring-offset-2 hover:bg-brand-900 focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <span className="sr-only">
                  {t("nav.myAccount")}: {user.name}
                </span>
                {initials}
              </button>

              {accountOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40 cursor-default"
                    aria-label={t("nav.closeMenu")}
                    onClick={() => setAccountOpen(false)}
                  />

                  <div
                    role="menu"
                    className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border bg-white p-2 shadow-xl"
                  >
                    <div className="px-3 py-2">
                      <p className="truncate text-sm font-black">
                        {user.name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {t("nav.accountName")}
                      </p>
                    </div>

                    <div className="my-1 border-t" />

                    <Link
                      role="menuitem"
                      href="/account"
                      onClick={() =>
                        setAccountOpen(false)
                      }
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-slate-50"
                    >
                      <UserRound className="size-4" />
                      {t("nav.myAccount")}
                    </Link>

                    <Link
                      role="menuitem"
                      href={
                        canSell
                          ? "/selling"
                          : "/selling/start"
                      }
                      onClick={() =>
                        setAccountOpen(false)
                      }
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-slate-50"
                    >
                      <Store className="size-4" />
                      {canSell
                        ? t("nav.selling")
                        : t("nav.startSelling")}
                    </Link>

                    <button
                      role="menuitem"
                      type="button"
                      onClick={signOut}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50"
                    >
                      <LogOut className="size-4" />
                      {t("nav.signOut")}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label={t("nav.openMenu")}
            aria-expanded={menuOpen}
          >
            <Menu className="size-6" />
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
            />

            <span className="truncate text-xs text-slate-400">
              {t("nav.dealsNear", {
                city: location.city,
              })}
            </span>
          </div>

          <SearchBar
            compact
            location={location}
            showSubmitButton={false}
          />
        </div>
      )}

      {!privateWorkspace && <CategoryNav />}

      {menuOpen && (
        <div
          className="fixed inset-0 z-[90] sm:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={t("nav.openMenu")}
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
            aria-label={t("nav.closeMenu")}
            onClick={() => setMenuOpen(false)}
          />

          <div className="absolute bottom-0 left-0 right-0 max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl">
            <div className="flex items-center justify-between">
              <MarketliftLogo size="compact" />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMenuOpen(false)}
                aria-label={t("nav.closeMenu")}
              >
                <X className="size-5" />
              </Button>
            </div>

            {user ? (
              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <span className="grid size-11 place-items-center rounded-full bg-brand-800 text-sm font-black text-white">
                  {initials}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-black">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t("nav.accountName")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button variant="outline" asChild>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t("nav.login")}
                  </Link>
                </Button>

                <Button asChild>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t("nav.register")}
                  </Link>
                </Button>
              </div>
            )}

            <div className="mt-4 grid gap-2 rounded-2xl bg-slate-50 p-2">
              <LocationSelector
                value={location}
                onChange={setLocation}
              />

              <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                <span className="text-sm font-semibold text-slate-700">
                  {t("settings.language")}
                </span>
                <LanguageSwitcher compact />
              </div>
            </div>

            <nav
              className="mt-5 grid grid-cols-2 gap-2"
              aria-label={t("nav.openMenu")}
            >
              <Link
                href="/search"
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl border p-4 text-sm font-bold text-slate-700"
              >
                {t("nav.browseMarketplace")}
              </Link>

              {user && (
                <Link
                  href="/account/saved"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl border p-4 text-sm font-bold text-slate-700"
                >
                  {t("nav.saved")}
                </Link>
              )}

              {user && (
                <Link
                  href="/messages"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl border p-4 text-sm font-bold text-slate-700"
                >
                  {t("nav.messages")}
                </Link>
              )}

              {user && (
                <Link
                  href="/notifications"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl border p-4 text-sm font-bold text-slate-700"
                >
                  {t("nav.notifications")}
                </Link>
              )}

              {user && (
                <Link
                  href={
                    canSell
                      ? "/selling"
                      : "/selling/start"
                  }
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl border p-4 text-sm font-bold text-slate-700"
                >
                  {canSell
                    ? t("nav.selling")
                    : t("nav.startSelling")}
                </Link>
              )}
            </nav>

            <Button className="mt-4 w-full" asChild>
              <Link
                href={sellHref}
                onClick={() => setMenuOpen(false)}
              >
                <Plus className="size-4" />
                {t("nav.sell")}
              </Link>
            </Button>

            {user && (
              <Button
                variant="ghost"
                className="mt-2 w-full text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                onClick={signOut}
              >
                <LogOut className="size-4" />
                {t("nav.signOut")}
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
