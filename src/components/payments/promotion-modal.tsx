'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { CheckCircle2, Rocket, X } from 'lucide-react';

import { paymentService } from '@/services/payment.service';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLocale } from '@/providers/locale-provider';
import type { PromotionOption } from '@/types';

const money = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

export function PromotionModal({
  listingId,
  listingTitle,
  onClose,
  onSuccess,
}: {
  listingId: string;
  listingTitle: string;
  onClose: () => void;
  onSuccess: (promotion: PromotionOption) => void;
}) {
  const { t, tr } = useLocale();
  const query = useQuery({
    queryKey: ['promotions'],
    queryFn: paymentService.getPromotions,
  });
  const [selected, setSelected] = useState<PromotionOption>();
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);
  const [pendingReference, setPendingReference] = useState('');

  async function buy() {
    if (!selected) return;

    setPaying(true);
    try {
      const payment = await paymentService.createPromotionPayment({
        listingId,
        promotionId: selected.id,
        method: 'pix',
      });
      if (payment.status === 'paid') {
        setDone(true);
        onSuccess(selected);
      } else {
        setPendingReference(payment.reference);
      }
    } finally {
      setPaying(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="top-auto bottom-0 left-0 max-h-[92dvh] w-full max-w-none translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-b-none rounded-t-3xl p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-bold text-brand-700">
              {t('payments.promotion.title')}
            </p>
            <DialogTitle className="mt-1 truncate text-xl font-black">
              {listingTitle}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {t('payments.promotion.notice')}
            </DialogDescription>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label={t('payments.promotion.close')}
          >
            <X className="size-5" aria-hidden="true" />
          </Button>
        </div>

        {done ? (
          <div className="py-12 text-center" role="status" aria-live="polite">
            <CheckCircle2
              className="mx-auto size-14 text-brand-600"
              aria-hidden="true"
            />
            <h3 className="mt-4 text-2xl font-black">
              {t('payments.promotion.success')}
            </h3>
            <p className="mt-2 text-slate-500">
              {t('payments.promotion.activeBody', {
                name: selected ? tr(selected.name) : '',
              })}
            </p>
            <Button className="mt-6" onClick={onClose}>
              {t('common.done')}
            </Button>
          </div>
        ) : (
          <>
            <div
              className="mt-6 grid gap-3 sm:grid-cols-2"
              role="group"
              aria-label={t('payments.promotion.title')}
            >
              {query.data?.map((promotion) => (
                <button
                  type="button"
                  key={promotion.id}
                  aria-pressed={selected?.id === promotion.id}
                  onClick={() => setSelected(promotion)}
                  className={`min-h-28 rounded-2xl border p-4 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-brand-500 ${
                    selected?.id === promotion.id
                      ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <strong>{tr(promotion.name)}</strong>
                    <Rocket className="size-4 text-brand-700" aria-hidden="true" />
                  </div>
                  <p className="mt-2 text-sm leading-5 text-slate-500">
                    {tr(promotion.description)}
                  </p>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <span className="text-xs font-bold text-slate-500">
                      {t('payments.promotion.days', {
                        count: promotion.durationDays,
                      })}
                    </span>
                    <span className="font-black">{money(promotion.price)}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">
              {t('payments.promotion.notice')}
            </div>

            {pendingReference && (
              <div className="mt-3 rounded-xl bg-brand-50 p-3 text-sm font-semibold text-brand-800">
                {t('payments.promotion.pending', { reference: pendingReference })}
              </div>
            )}

            <Button
              className="mt-4 w-full"
              size="lg"
              disabled={!selected || paying}
              loading={paying}
              loadingText={t('payments.promotion.processing')}
              onClick={buy}
            >
              {selected
                ? t('payments.promotion.buy', {
                    name: tr(selected.name),
                    amount: money(selected.price),
                  })
                : t('payments.promotion.choose')}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
