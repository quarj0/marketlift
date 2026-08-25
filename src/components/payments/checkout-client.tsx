'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { Banknote, CheckCircle2, Copy, CreditCard, FileText, QrCode, ShieldCheck, Smartphone } from 'lucide-react';
import { paymentService } from '@/services/payment.service';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/providers/locale-provider';
import { useMarket } from '@/providers/market-provider';
import { useAuth } from '@/providers/auth-provider';
import type { Payment, PaymentMethod } from '@/types';

const METHOD_META = {
  pix: ['Pix', QrCode],
  card: ['Card', CreditCard],
  boleto: ['Boleto', FileText],
  mobile_money: ['Mobile Money', Smartphone],
  bank_transfer: ['Bank transfer', Banknote],
  ussd: ['USSD', Smartphone],
  eft: ['EFT', Banknote],
} as const;

export function CheckoutClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t, tr } = useLocale();
  const { user } = useAuth();
  const { market, enabledMarkets, formatMoney } = useMarket();
  const sellerCountry = user?.countryCode || market.code;
  const sellerMarket = enabledMarkets.find((item) => item.code === sellerCountry) || market;
  const allowedMethods = useMemo(
    () => sellerMarket.paymentMethods.filter((item): item is PaymentMethod => item in METHOD_META),
    [sellerMarket.paymentMethods],
  );
  const plans = useQuery({
    queryKey: ['seller-plans', sellerCountry],
    queryFn: () => paymentService.getPlans(sellerCountry),
  });
  const plan = plans.data?.find((item) => item.id === (searchParams.get('plan') || 'pro'));
  const cycle = searchParams.get('cycle') === 'yearly' ? 'yearly' : 'monthly';
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const method = selectedMethod && allowedMethods.includes(selectedMethod)
    ? selectedMethod
    : ((allowedMethods[0] || 'card') as PaymentMethod);
  const [status, setStatus] = useState<'idle' | 'pending' | 'paid' | 'failed'>('idle');
  const [payment, setPayment] = useState<Payment | null>(null);
  const amount = plan ? (cycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice) : 0;
  const currency = plan?.currency || sellerMarket.currency;


  async function pay() {
    if (!plan || !allowedMethods.length) return;
    setStatus('pending');
    try {
      const created = await paymentService.createSubscriptionPayment({ planId: plan.id, billingCycle: cycle, method });
      setPayment(created);
      if (created.status === 'paid') {
        await queryClient.invalidateQueries({ queryKey: ['seller-subscription'] });
        setStatus('paid');
        return;
      }
      const authorizationUrl = created.checkoutData?.authorization_url;
      if (authorizationUrl) {
        window.location.assign(authorizationUrl);
      }
    } catch {
      setStatus('failed');
    }
  }

  async function refreshPayment() {
    if (!payment) return;
    setStatus('pending');
    try {
      const refreshed = await paymentService.refreshPayment(payment.id);
      setPayment(refreshed);
      if (refreshed.status === 'paid') {
        await queryClient.invalidateQueries({ queryKey: ['seller-subscription'] });
        setStatus('paid');
      } else if (refreshed.status === 'failed' || refreshed.status === 'cancelled') {
        setStatus('failed');
      }
    } catch {
      setStatus('failed');
    }
  }

  if (status === 'paid') {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border bg-white p-8 text-center shadow-sm">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-50 text-brand-700"><CheckCircle2 className="size-9" /></span>
        <h2 className="mt-5 text-2xl font-black">{t('payments.checkout.success')}</h2>
        <p className="mt-2 text-slate-500">{t('payments.checkout.successBody', { name: plan ? tr(plan.name) : '' })}</p>
        <Button className="mt-6" onClick={() => router.push('/selling')}>{t('payments.checkout.back')}</Button>
      </div>
    );
  }

  const pixCode = payment?.checkoutData?.qr_code;
  const ticketUrl = payment?.checkoutData?.ticket_url || payment?.checkoutData?.authorization_url;
  const boletoCode = payment?.checkoutData?.barcode_content;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <section className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-2"><ShieldCheck className="size-5 text-brand-600" /><h2 className="text-xl font-black">{t('payments.checkout.title')}</h2></div>
        <p className="mt-1 text-sm text-slate-500">{sellerMarket.countryName} · {sellerMarket.paymentProvider}</p>

        {!payment && (
          <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {allowedMethods.map((id) => {
              const [label, Icon] = METHOD_META[id];
              return (
                <button type="button" key={id} aria-pressed={method === id} onClick={() => setSelectedMethod(id)} className={`rounded-2xl border p-4 text-left ${method === id ? 'border-brand-500 bg-brand-50' : 'hover:bg-slate-50'}`}>
                  <Icon className="size-5" /><p className="mt-2 text-sm font-black">{label}</p>
                </button>
              );
            })}
          </div>
        )}

        {!allowedMethods.length && <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-900">Payments are not configured for {sellerMarket.countryName} yet.</p>}

        {payment && payment.status === 'pending' && (
          <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            <p className="font-black">{t('payments.checkout.pending')}</p>
            <p className="mt-1 text-sm text-slate-500">{t('payments.checkout.pendingBody', { reference: payment.reference })}</p>
            {pixCode && <Button variant="outline" className="mt-4 w-full" onClick={() => navigator.clipboard?.writeText(pixCode)}><Copy className="size-4" />{t('payments.checkout.copyPix')}</Button>}
            {boletoCode && <Button variant="outline" className="mt-3 w-full" onClick={() => navigator.clipboard?.writeText(boletoCode)}><Copy className="size-4" />{t('payments.checkout.copyBoleto')}</Button>}
            {ticketUrl && <Button asChild variant="outline" className="mt-3 w-full"><a href={ticketUrl} target="_blank" rel="noreferrer">Continue to secure payment</a></Button>}
          </div>
        )}

        {status === 'failed' && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{t('payments.checkout.failed')}</p>}

        {!payment ? (
          <Button className="mt-6 w-full" size="lg" onClick={pay} disabled={status === 'pending' || !plan || !allowedMethods.length}>
            {status === 'pending' ? t('payments.checkout.confirming') : t('payments.checkout.pay', { amount: formatMoney(amount, currency) })}
          </Button>
        ) : payment.status === 'pending' ? (
          <Button className="mt-6 w-full" size="lg" onClick={refreshPayment}>{t('payments.checkout.checkStatus')}</Button>
        ) : null}
      </section>

      <aside className="h-fit rounded-3xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-slate-500">{t('payments.checkout.summary')}</p>
        <h3 className="mt-2 text-2xl font-black">{plan ? tr(plan.name) : t('payments.checkout.loading')}</h3>
        <p className="mt-1 text-sm text-slate-500">{t('payments.checkout.billing', { cycle: cycle === 'yearly' ? t('payments.plan.yearly') : t('payments.plan.monthly') })}</p>
        <div className="my-5 border-t" />
        <div className="flex justify-between text-sm"><span>{t('payments.checkout.plan')}</span><strong>{formatMoney(amount, currency)}</strong></div>
        <div className="mt-4 flex justify-between border-t pt-4 text-lg"><strong>{t('payments.checkout.total')}</strong><strong>{formatMoney(amount, currency)}</strong></div>
        <p className="mt-5 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">Marketlift charges only for platform plans/promotions. Buyer–seller transactions stay outside Marketlift.</p>
      </aside>
    </div>
  );
}
