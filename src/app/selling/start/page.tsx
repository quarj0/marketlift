"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2, ShieldCheck, Store, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AccountSidebar } from "@/components/account/account-sidebar";
import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { useLocale } from "@/providers/locale-provider";
import { useMarket } from "@/providers/market-provider";

type SellingBenefit = {
  icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
};

const benefits: SellingBenefit[] = [
  {
    icon: Store,
    titleKey: "selling.start.benefit.publish",
    descriptionKey: "selling.start.benefit.publishBody",
  },
  {
    icon: ShieldCheck,
    titleKey: "selling.start.benefit.trust",
    descriptionKey: "selling.start.benefit.trustBody",
  },
  {
    icon: TrendingUp,
    titleKey: "selling.start.benefit.grow",
    descriptionKey: "selling.start.benefit.growBody",
  },
];

function safeSellingReturnTo(value: string | null) {
  if (!value || !value.startsWith("/selling") || value.startsWith("//")) {
    return null;
  }
  return value;
}

export default function StartSellingPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { canSell, activateSelling } = useAuth();
  const { t } = useLocale();
  const { formatMoney } = useMarket();
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enableSelling() {
    setActivating(true);
    setError(null);

    try {
      await activateSelling();
      const returnTo = safeSellingReturnTo(params.get("returnTo"));
      if (returnTo) router.replace(returnTo);
    } catch {
      setError(t("selling.start.error"));
    } finally {
      setActivating(false);
    }
  }

  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
        <div className="mb-5 sm:mb-7">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-700">
            {t("selling.start.pageEyebrow")}
          </p>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            {t("selling.start.pageTitle")}
          </h1>
          <p className="mt-1 text-slate-500">
            {t("selling.start.pageBody")}
          </p>
        </div>

        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <AccountSidebar />

          <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-8">
            {canSell ? (
              <div className="mx-auto max-w-xl py-8 text-center">
                <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-50 text-brand-700">
                  <CheckCircle2 className="size-9" />
                </span>

                <h2 className="mt-5 text-2xl font-black">
                  {t("selling.start.already")}
                </h2>

                <p className="mt-2 text-slate-500">
                  {t("selling.start.alreadyBody")}
                </p>

                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <Button asChild>
                    <Link href="/selling">
                      {t("selling.start.open")}
                    </Link>
                  </Button>

                  <Button variant="outline" asChild>
                    <Link href="/selling/listings/new">
                      {t("selling.start.post")}
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-8 xl:grid-cols-[1fr_330px]">
                <div>
                  <h2 className="text-2xl font-black">
                    {t("selling.start.title")}
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    {t("selling.start.intro")}
                  </p>

                  <div className="mt-7 grid gap-4 sm:grid-cols-3">
                    {benefits.map(({ icon: Icon, titleKey, descriptionKey }) => (
                      <div key={titleKey} className="rounded-2xl border p-5">
                        <Icon className="size-6 text-brand-600" />
                        <h3 className="mt-3 font-black">
                          {t(titleKey)}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {t(descriptionKey)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-7 rounded-2xl bg-slate-50 p-5">
                    <h3 className="font-black">
                      {t("selling.start.moderation")}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {t("selling.start.moderationBody")}
                    </p>
                  </div>

                  {error && (
                    <p
                      className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700"
                      role="alert"
                    >
                      {error}
                    </p>
                  )}

                  <Button
                    type="button"
                    className="mt-7 w-full sm:w-auto"
                    size="lg"
                    loading={activating}
                    loadingText={t("selling.start.enabling")}
                    onClick={enableSelling}
                  >
                    {t("selling.start.activate")}
                  </Button>
                </div>

                <aside className="h-fit rounded-2xl border border-brand-100 bg-brand-50 p-5">
                  <p className="text-sm font-bold text-brand-800">
                    {t("selling.start.free")}
                  </p>
                  <p className="mt-2 text-3xl font-black text-brand-950">
                    {formatMoney(0)}
                  </p>
                  <p className="mt-1 text-sm text-brand-800">
                    {t("selling.start.freeBody")}
                  </p>
                  <p className="mt-4 text-xs leading-5 text-brand-800">
                    {t("selling.start.freeNote")}
                  </p>
                </aside>
              </div>
            )}
          </section>
        </div>
      </main>
    </MarketplaceShell>
  );
}
