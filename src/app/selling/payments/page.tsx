'use client';

import { useQuery } from '@tanstack/react-query';
import { CreditCard, ReceiptText } from 'lucide-react';
import { MarketplaceShell } from '@/components/layout/marketplace-shell';
import { SellingSidebar } from '@/components/selling/selling-sidebar';
import { EmptyState, InlineError, PageLoading } from '@/components/feedback/async-states';
import { useLocale } from '@/providers/locale-provider';
import { paymentService } from '@/services/payment.service';

export default function PaymentsPage() {
  const { t, locale } = useLocale();
  const query = useQuery({ queryKey: ['seller-payments'], queryFn: paymentService.getPayments });
  const dateLocale = locale === 'pt-BR' ? 'pt-BR' : 'en-US';

  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
        <div className="mb-5 sm:mb-7">
          <p className="text-xs font-black uppercase tracking-[.14em] text-brand-700 sm:text-sm">{t('selling.eyebrow')}</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{t('selling.payments.title')}</h1>
          <p className="mt-1 text-sm leading-6 text-slate-500 sm:text-base">{t('selling.payments.body')}</p>
        </div>
        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <SellingSidebar />
          <section className="min-w-0">
            {query.isLoading && <PageLoading label={t('selling.payments.loading')} />}
            {query.isError && <InlineError title={t('selling.payments.error')} description={t('selling.payments.errorBody')} onRetry={() => query.refetch()} />}
            {!query.isLoading && !query.isError && query.data?.length === 0 && <EmptyState title={t('selling.payments.empty')} description={t('selling.payments.emptyBody')} href="/selling/plan" action={t('selling.payments.plans')} />}
            {!!query.data?.length && (
              <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <div className="border-b p-4 sm:p-5"><div className="flex items-center gap-2"><CreditCard className="size-5 text-brand-700" aria-hidden="true" /><h2 className="font-black">{t('selling.payments.history')}</h2></div></div>
                <div className="divide-y">
                  {query.data.map((payment) => (
                    <article key={payment.id} className="grid grid-cols-[44px_minmax(0,1fr)] gap-3 p-4 sm:flex sm:items-center sm:gap-4 sm:p-5">
                      <span className="grid size-11 place-items-center rounded-xl bg-slate-100"><ReceiptText className="size-4" aria-hidden="true" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold">{t(`selling.payments.purpose.${payment.purpose}`)}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">{payment.reference} · {new Date(payment.createdAt).toLocaleDateString(dateLocale)}</p>
                      </div>
                      <div className="col-span-2 flex items-center justify-between border-t pt-3 text-left sm:col-span-1 sm:block sm:border-0 sm:pt-0 sm:text-right">
                        <p className="font-black">R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <span className="text-xs font-black uppercase text-brand-700">{t(`selling.payments.status.${payment.status}`)}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </MarketplaceShell>
  );
}
