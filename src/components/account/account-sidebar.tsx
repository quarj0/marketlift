"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Heart,
  Home,
  MessageCircle,
  Settings,
  Star,
  Store,
  User,
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
import { useAuth } from "@/providers/auth-provider";
import { useLocale } from "@/providers/locale-provider";

function isActive(pathname: string, href: string) {
  if (href === "/account") return pathname === "/account";
  if (href === "/messages") return pathname.startsWith("/messages");
  if (href === "/selling") return pathname.startsWith("/selling");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AccountSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { canSell } = useAuth();
  const { t } = useLocale();

  const items = useMemo(
    () =>
      [
        ["/account", t("account.overview"), Home],
        ["/account/profile", t("account.profile"), User],
        ["/account/saved", t("account.saved"), Heart],
        ["/messages", t("nav.messages"), MessageCircle],
        ["/account/reviews", t("account.reviews"), Star],
        ["/account/settings", t("account.settings"), Settings],
        [
          canSell ? "/selling" : "/selling/start",
          canSell ? t("nav.selling") : t("nav.startSelling"),
          Store,
        ],
      ] as const,
    [canSell, t],
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
                {t("account.menu")}
              </span>
              <span className="block truncate text-sm font-black">
                {current[1]}
              </span>
            </span>
          </span>
          <ChevronDown className="size-5 shrink-0 text-slate-400" aria-hidden="true" />
        </button>
      </div>

      <aside
        className="hidden rounded-2xl border bg-white p-2 shadow-sm lg:block"
        aria-label={t("nav.account")}
      >
        <nav className="space-y-1">
          {items.map(([href, label, Icon]) => {
            const active = isActive(pathname, href);
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
                {label}
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
                {t("account.myMarketlift")}
              </p>
              <DialogTitle className="mt-1 text-xl font-black text-slate-950">
                {t("account.navigate")}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {t("nav.account")}
              </DialogDescription>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label={t("nav.closeMenu")}
            >
              <X className="size-5" aria-hidden="true" />
            </Button>
          </div>

          <nav className="grid grid-cols-2 gap-2" aria-label={t("nav.account")}>
            {items.map(([href, label, Icon]) => {
              const active = isActive(pathname, href);
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
                </Link>
              );
            })}
          </nav>
        </DialogContent>
      </Dialog>
    </>
  );
}
