'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { CheckCircle2, Rocket, X } from 'lucide-react';
import { paymentService } from '@/services/payment.service';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/providers/locale-provider';
import type { PromotionOption } from '@/types';

const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function PromotionModal({
  listingTitle,
  onClose,
  onSuccess,
}: {
  listingTitle: string;
  onClose: () => void;
  onSuccess: (promotion: PromotionOption) => void;
}) {
  const { t, tr } = useLocale();
  const query = useQuery({ queryKey: ['promotions'], queryFn: paymentService.getPromotions });
  const [selected, setSelected] = useState<PromotionOption>();
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);

  async function buy() {
    if (!selected) return;
    setPaying(true);
    try {
      const payment = await paymentService.createPayment({ purpose: 'promotion', amount: selected.price, method: 'pix' });
      await paymentService.confirmPayment(payment.id);
      setDone(true);
      onSuccess(selected);
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-end bg-black/50 p-0 sm:place-items-center sm:p-4">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-2xl sm:rounded-3xl sm:p-7">
        <div className="flex items-start justify-between">
          <div><p className="text-sm font-bold text-brand-700">{t('payments.promotion.title')}</p><h2 className="mt-1 text-xl font-black">{listingTitle}</h2></div>
          <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full hover:bg-slate-100" aria-label={t('payments.promotion.close')}><X className="size-5" /></button>
        </div>

        {done ? (
          <div className="py-12 text-center">
            <CheckCircle2 className="mx-auto size-14 text-brand-600" />
            <h3 className="mt-4 text-2xl font-black">{t('payments.promotion.success')}</h3>
            <p className="mt-2 text-slate-500">{t('payments.promotion.activeBody', { name: selected ? tr(selected.name) : '' })}</p>
            <Button className="mt-6" onClick={onClose}>{t('common.done')}</Button>
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {query.data?.map((promotion) => (
                <button type="button" key={promotion.id} aria-pressed={selected?.id === promotion.id} onClick={() => setSelected(promotion)} className={`rounded-2xl border p-4 text-left ${selected?.id === promotion.id ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100' : 'hover:bg-slate-50'}`}>
                  <div className="flex items-center justify-between"><strong>{tr(promotion.name)}</strong><Rocket className="size-4 text-brand-700" /></div>
                  <p className="mt-2 text-sm leading-5 text-slate-500">{tr(promotion.description)}</p>
                  <div className="mt-4 flex items-end justify-between"><span className="text-xs font-bold text-slate-500">{t('payments.promotion.days', { count: promotion.durationDays })}</span><span className="font-black">{money(promotion.price)}</span></div>
                </button>
              ))}
            </div>
            <div className="mt-6 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">{t('payments.promotion.notice')}</div>
            <Button className="mt-4 w-full" size="lg" disabled={!selected || paying} onClick={buy}>
              {paying ? t('payments.promotion.processing') : selected ? t('payments.promotion.buy', { name: tr(selected.name), amount: money(selected.price) }) : t('payments.promotion.choose')}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
