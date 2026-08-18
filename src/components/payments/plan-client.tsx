'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Check, ShieldCheck, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { paymentService } from '@/services/payment.service';
import { EmptyState, InlineError, PageLoading } from '@/components/feedback/async-states';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/providers/locale-provider';
import type { BillingCycle } from '@/types';

const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function PlanClient() {
  const { t, tr } = useLocale();
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const plans = useQuery({ queryKey: ['seller-plans'], queryFn: paymentService.getPlans });
  const current = useQuery({ queryKey: ['seller-subscription'], queryFn: paymentService.getSubscription });

  if (plans.isLoading || current.isLoading) return <PageLoading label={t('payments.plan.loading')} />;
  if (plans.isError || current.isError) return <InlineError title={t('payments.plan.error')} description={t('payments.plan.errorBody')} onRetry={() => { void plans.refetch(); void current.refetch(); }} />;
  if (!plans.data?.length) return <EmptyState title={t('payments.plan.empty')} description={t('payments.plan.emptyBody')} />;

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <div className="flex items-center gap-2"><ShieldCheck className="size-5 text-brand-700" aria-hidden="true" /><h2 className="font-black">{t('payments.plan.heading')}</h2></div>
          <p className="mt-1 text-sm leading-6 text-slate-500">{t('payments.plan.body')}</p>
        </div>
        <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1" aria-label={t('payments.plan.billing')}>
          <button type="button" aria-pressed={cycle === 'monthly'} onClick={() => setCycle('monthly')} className={`min-h-11 rounded-lg px-4 py-2 text-sm font-bold ${cycle === 'monthly' ? 'bg-white shadow-sm' : 'text-slate-600'}`}>{t('payments.plan.monthly')}</button>
          <button type="button" aria-pressed={cycle === 'yearly'} onClick={() => setCycle('yearly')} className={`min-h-11 rounded-lg px-4 py-2 text-sm font-bold ${cycle === 'yearly' ? 'bg-white shadow-sm' : 'text-slate-600'}`}>{t('payments.plan.yearly')} <span className="text-brand-700">{t('payments.plan.save')}</span></button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.data.map((plan) => {
          const active = current.data?.planId === plan.id;
          const price = cycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
          const planName = tr(plan.name);
          return (
            <article key={plan.id} className={`relative flex min-h-[420px] flex-col rounded-3xl border bg-white p-5 shadow-sm sm:p-6 ${plan.recommended ? 'border-brand-300 ring-2 ring-brand-100' : ''}`}>
              {plan.recommended && <span className="absolute right-4 top-4 rounded-full bg-brand-700 px-3 py-1 text-xs font-black text-white">{t('payments.plan.popular')}</span>}
              <p className="text-sm font-bold text-slate-500">{planName}</p>
              <div className="mt-3"><span className="text-3xl font-black">{money(price)}</span>{price > 0 && <span className="text-sm text-slate-500">{cycle === 'monthly' ? t('payments.plan.perMonth') : t('payments.plan.perYear')}</span>}</div>
              <p className="mt-3 text-sm font-semibold text-slate-700">{t('payments.plan.activeLimit', { count: plan.listingLimit, plus: plan.id === 'business' ? '+' : '' })}</p>
              <div className="my-5 border-t" />
              <ul className="space-y-3 text-sm">{plan.features.map((feature) => <li key={feature} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden="true" /><span>{tr(feature)}</span></li>)}</ul>
              <div className="mt-auto pt-6">
                {active ? (
                  <Button className="w-full" variant="secondary" disabled>{t('payments.plan.current')}</Button>
                ) : plan.id === 'free' ? (
                  <Button className="w-full" variant="outline" disabled={current.data?.planId === 'free'}>{t('payments.plan.downgrade')}</Button>
                ) : (
                  <Button className="w-full" asChild><Link href={`/selling/checkout?plan=${plan.id}&cycle=${cycle}`}><Sparkles className="size-4" />{t('payments.plan.choose', { name: planName })}</Link></Button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
