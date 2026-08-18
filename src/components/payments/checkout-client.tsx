'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Copy, CreditCard, FileText, QrCode, ShieldCheck } from 'lucide-react';
import { paymentService } from '@/services/payment.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/providers/locale-provider';
import type { PaymentMethod } from '@/types';

const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function CheckoutClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t, tr } = useLocale();
  const plans = useQuery({ queryKey: ['seller-plans'], queryFn: paymentService.getPlans });
  const plan = plans.data?.find((item) => item.id === (searchParams.get('plan') || 'pro'));
  const cycle = searchParams.get('cycle') === 'yearly' ? 'yearly' : 'monthly';
  const [method, setMethod] = useState<PaymentMethod>('pix');
  const [status, setStatus] = useState<'idle' | 'pending' | 'paid' | 'failed'>('idle');
  const amount = plan ? (cycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice) : 0;

  async function pay() {
    if (!plan) return;
    setStatus('pending');
    try {
      const payment = await paymentService.createPayment({ purpose: 'subscription', amount, method });
      await paymentService.confirmPayment(payment.id);
      await paymentService.activatePlan(plan.id, cycle);
      await queryClient.invalidateQueries({ queryKey: ['seller-subscription'] });
      setStatus('paid');
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

  const methods = [
    ['pix', t('payments.checkout.method.pix'), QrCode],
    ['card', t('payments.checkout.method.card'), CreditCard],
    ['boleto', t('payments.checkout.method.boleto'), FileText],
  ] as const;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <section className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-2"><ShieldCheck className="size-5 text-brand-600" /><h2 className="text-xl font-black">{t('payments.checkout.title')}</h2></div>
        <p className="mt-1 text-sm text-slate-500">{t('payments.checkout.body')}</p>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {methods.map(([id, label, Icon]) => (
            <button type="button" key={id} aria-pressed={method === id} onClick={() => setMethod(id)} className={`rounded-2xl border p-4 text-left ${method === id ? 'border-brand-500 bg-brand-50' : 'hover:bg-slate-50'}`}>
              <Icon className="size-5" /><p className="mt-2 text-sm font-black">{label}</p>
            </button>
          ))}
        </div>

        {method === 'pix' && (
          <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            <div className="mx-auto grid aspect-square w-44 place-items-center rounded-xl border-8 border-white bg-[linear-gradient(45deg,#111_25%,transparent_25%,transparent_75%,#111_75%),linear-gradient(45deg,#111_25%,transparent_25%,transparent_75%,#111_75%)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]"><span className="rounded bg-white px-2 py-1 text-xs font-black">{t('payments.checkout.pixQr')}</span></div>
            <p className="mt-4 text-center text-sm text-slate-500">{t('payments.checkout.pixBody')}</p>
            <Button variant="outline" className="mt-3 w-full" onClick={() => navigator.clipboard?.writeText('000201MARKETLIFT-PIX-MOCK')}><Copy className="size-4" />{t('payments.checkout.copyPix')}</Button>
          </div>
        )}

        {method === 'card' && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className="mb-1 block text-sm font-bold">{t('payments.checkout.cardNumber')}</span><Input placeholder="0000 0000 0000 0000" /></label>
            <label className="sm:col-span-2"><span className="mb-1 block text-sm font-bold">{t('payments.checkout.cardName')}</span><Input placeholder="Lucas Almeida" /></label>
            <label><span className="mb-1 block text-sm font-bold">{t('payments.checkout.expiry')}</span><Input placeholder="MM/YY" /></label>
            <label><span className="mb-1 block text-sm font-bold">{t('payments.checkout.cvv')}</span><Input placeholder="123" /></label>
          </div>
        )}

        {method === 'boleto' && (
          <div className="mt-6 rounded-2xl bg-slate-50 p-6"><FileText className="size-8 text-brand-700" /><h3 className="mt-3 font-black">{t('payments.checkout.boleto')}</h3><p className="mt-1 text-sm text-slate-500">{t('payments.checkout.boletoBody')}</p></div>
        )}

        {status === 'failed' && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{t('payments.checkout.failed')}</p>}

        <Button className="mt-6 w-full" size="lg" onClick={pay} disabled={status === 'pending' || !plan}>
          {status === 'pending' ? t('payments.checkout.confirming') : t('payments.checkout.pay', { amount: money(amount) })}
        </Button>
      </section>

      <aside className="h-fit rounded-3xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-slate-500">{t('payments.checkout.summary')}</p>
        <h3 className="mt-2 text-2xl font-black">{plan ? tr(plan.name) : t('payments.checkout.loading')}</h3>
        <p className="mt-1 text-sm text-slate-500">{t('payments.checkout.billing', { cycle: cycle === 'yearly' ? t('payments.plan.yearly') : t('payments.plan.monthly') })}</p>
        <div className="my-5 border-t" />
        <div className="flex justify-between text-sm"><span>{t('payments.checkout.plan')}</span><strong>{money(amount)}</strong></div>
        <div className="mt-4 flex justify-between border-t pt-4 text-lg"><strong>{t('payments.checkout.total')}</strong><strong>{money(amount)}</strong></div>
        <p className="mt-5 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">{t('payments.checkout.noEscrow')}</p>
      </aside>
    </div>
  );
}
