"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  BarChart3,
  ChevronDown,
  CreditCard,
  FileText,
  MessageCircle,
  PlusCircle,
  Settings,
  Star,
  Store,
  UserRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import { useMarket } from "@/providers/market-provider";
import { useAuth } from "@/providers/auth-provider";

function isActive(pathname: string, href: string) {
  if (href === "/selling") return pathname === "/selling";
  if (href === "/messages") return pathname.startsWith("/messages");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SellingSidebar() {
  const { user } = useAuth();
  const { paymentsEnabledForMarket, identityVerificationEnabledForMarket } =
    useMarket();
  const paymentsEnabled = paymentsEnabledForMarket(user?.countryCode);
  const identityVerificationEnabled = identityVerificationEnabledForMarket(
    user?.countryCode,
  );
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { t } = useLocale();

  const items = useMemo(
    () =>
      [
        ["/selling", t("selling.menu.overview"), BarChart3],
        ["/selling/listings", t("selling.menu.listings"), FileText],
        ["/selling/listings/new", t("selling.menu.add"), PlusCircle],
        ["/messages", t("selling.menu.messages"), MessageCircle],
        ["/selling/plan", t("selling.menu.plan"), Store],
        ["/selling/verification", t("selling.menu.verification"), BadgeCheck],
        ["/selling/reviews", t("selling.menu.reviews"), Star],
        ["/selling/payments", t("selling.menu.payments"), CreditCard],
        ["/selling/profile", t("selling.menu.profile"), UserRound],
        ["/selling/settings", t("selling.menu.settings"), Settings],
      ] as const,
    [t],
  );

  const current = items.find(([href]) => isActive(pathname, href)) ?? items[0];
  const CurrentIcon = current[2];

  return (
    <>
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3 text-left shadow-sm focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <CurrentIcon className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-black uppercase tracking-[.14em] text-slate-400">
                {t("selling.menu")}
              </span>
              <span className="block truncate text-sm font-black">
                {current[1]}
              </span>
            </span>
          </span>
          <ChevronDown
            className="size-5 shrink-0 text-slate-400"
            aria-hidden="true"
          />
        </button>
      </div>

      <aside
        className="hidden rounded-2xl border bg-white p-2 shadow-sm lg:block"
        aria-label={t("selling.menu.nav")}
      >
        <nav className="space-y-1">
          {items.map(([href, label, Icon]) => {
            const active = isActive(pathname, href);
            const upcoming =
              (!paymentsEnabled &&
                ["/selling/plan", "/selling/payments"].includes(href)) ||
              (!identityVerificationEnabled &&
                href === "/selling/verification");
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition",
                  active
                    ? "bg-brand-50 text-brand-800 ring-1 ring-brand-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="flex-1">{label}</span>
                {upcoming && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-800">
                    {t("common.upcoming")}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="top-auto bottom-0 left-0 max-h-[82dvh] w-full max-w-none translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-b-none rounded-t-3xl px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 lg:hidden"
        >
          <div className="mb-3 flex items-center justify-between gap-4 px-1">
            <div>
              <p className="text-xs font-black uppercase tracking-[.14em] text-brand-700">
                {t("selling.eyebrow")}
              </p>
              <DialogTitle className="mt-1 text-xl font-black text-slate-950">
                {t("selling.menu.subtitle")}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {t("selling.menu.nav")}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label={t("selling.menu.close")}
            >
              <X className="size-5" aria-hidden="true" />
            </Button>
          </div>

          <nav
            className="grid grid-cols-2 gap-2"
            aria-label={t("selling.menu.nav")}
          >
            {items.map(([href, label, Icon]) => {
              const active = isActive(pathname, href);
              const upcoming =
                (!paymentsEnabled &&
                  ["/selling/plan", "/selling/payments"].includes(href)) ||
                (!identityVerificationEnabled &&
                  href === "/selling/verification");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-20 flex-col justify-between rounded-2xl border p-3 text-sm font-bold focus-visible:ring-2 focus-visible:ring-brand-400",
                    active
                      ? "border-brand-200 bg-brand-50 text-brand-900 ring-1 ring-brand-100"
                      : "bg-white text-slate-700",
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  <span>{label}</span>
                  {upcoming && (
                    <span className="mt-1 text-[9px] font-black uppercase tracking-wide text-amber-700">
                      {t("common.upcoming")}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </DialogContent>
      </Dialog>
    </>
  );
}
