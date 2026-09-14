"use client";

import { useQuery } from "@tanstack/react-query";
import { CreditCard, ReceiptText } from "lucide-react";

import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { SellingSidebar } from "@/components/selling/selling-sidebar";
import { SellerPaymentsClient } from "@/components/commerce/seller-payments-client";
import { EmptyState, InlineError, PageLoading } from "@/components/feedback/async-states";
import { paymentService } from "@/services/payment.service";
import { useLocale } from "@/providers/locale-provider";
import { useMarket } from "@/providers/market-provider";
import { useAuth } from "@/providers/auth-provider";

export default function PaymentsPage() {
  const { locale, t } = useLocale();
  const { user } = useAuth();
  const { formatMoney, paymentsEnabledForMarket } = useMarket();
  const paymentsEnabled = paymentsEnabledForMarket(user?.countryCode);
  const historyQuery = useQuery({
    queryKey: ["seller-payments-history"],
    queryFn: paymentService.getPayments,
    enabled: paymentsEnabled,
  });
  const dateLocale = locale === "pt-BR" ? "pt-BR" : "en-US";

  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
        <div className="mb-5 sm:mb-7">
          <p className="text-xs font-black uppercase tracking-[.14em] text-brand-700 sm:text-sm">{locale === "pt-BR" ? "Vendas" : "Sales"}</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Marketlift Payments</h1>
          <p className="mt-1 text-sm leading-6 text-slate-500 sm:text-base">{locale === "pt-BR" ? "Gerencie recebimentos de pedidos e consulte também pagamentos de planos e promoções." : "Manage marketplace order payouts and review plan or promotion payments in one place."}</p>
        </div>
        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <SellingSidebar />
          <section className="min-w-0 space-y-6">
            <SellerPaymentsClient />

            {paymentsEnabled && (
              <section className="overflow-hidden rounded-2xl border bg-white shadow-sm" aria-labelledby="billing-history-title">
                <div className="border-b p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <CreditCard className="size-5 text-brand-700" aria-hidden="true" />
                    <h2 id="billing-history-title" className="font-black">{t("selling.payments.history")}</h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{locale === "pt-BR" ? "Planos e promoções comprados no Marketlift." : "Marketlift plan and promotion purchases."}</p>
                </div>
                {historyQuery.isLoading && <PageLoading label={t("selling.payments.loading")} />}
                {historyQuery.isError && <div className="p-5"><InlineError title={t("selling.payments.error")} description={t("selling.payments.errorBody")} onRetry={() => historyQuery.refetch()} /></div>}
                {!historyQuery.isLoading && !historyQuery.isError && historyQuery.data?.length === 0 && (
                  <div className="p-5"><EmptyState title={t("selling.payments.empty")} description={t("selling.payments.emptyBody")} href="/selling/plan" action={t("selling.payments.plans")} /></div>
                )}
                {!!historyQuery.data?.length && (
                  <div className="divide-y">
                    {historyQuery.data.map((payment) => (
                      <article key={payment.id} className="grid grid-cols-[44px_minmax(0,1fr)] gap-3 p-4 sm:flex sm:items-center sm:gap-4 sm:p-5">
                        <span className="grid size-11 place-items-center rounded-xl bg-slate-100"><ReceiptText className="size-4" aria-hidden="true" /></span>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold">{t(`selling.payments.purpose.${payment.purpose}`)}</p>
                          <p className="mt-0.5 truncate text-xs text-slate-500">{payment.reference} · {new Date(payment.createdAt).toLocaleDateString(dateLocale)}</p>
                        </div>
                        <div className="col-span-2 flex items-center justify-between border-t pt-3 text-left sm:col-span-1 sm:block sm:border-0 sm:pt-0 sm:text-right">
                          <p className="font-black">{formatMoney(payment.amount, payment.currency)}</p>
                          <span className="text-xs font-black uppercase text-brand-700">{t(`selling.payments.status.${payment.status}`)}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}
          </section>
        </div>
      </main>
    </MarketplaceShell>
  );
}
