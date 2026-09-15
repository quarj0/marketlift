'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { MarketplaceShell } from '@/components/layout/marketplace-shell';
import { SellingSidebar } from '@/components/selling/selling-sidebar';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/providers/locale-provider';
import { sellerService, type SellerSettings } from '@/services/seller.service';

function Row({
  title,
  text,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  text: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-start justify-between gap-4 border-b py-4 last:border-0">
      <span>
        <b className="block text-sm">{title}</b>
        <span className="mt-1 block text-xs leading-5 text-slate-500">{text}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-5 accent-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}

function SellerSettingsForm({ initialSettings }: { initialSettings: SellerSettings }) {
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const [state, setState] = useState(initialSettings);
  const [saved, setSaved] = useState(false);

  const mutation = useMutation({
    mutationFn: sellerService.updateMySettings,
    onSuccess: (data) => {
      setState(data);
      queryClient.setQueryData(['seller', 'settings'], data);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    },
  });

  const set = (key: keyof SellerSettings, value: boolean) => {
    setSaved(false);
    setState((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="font-black">{t('selling.settings.notifications')}</h2>
        <div className="mt-3">
          <Row
            title={t('selling.settings.enquiries')}
            text={t('selling.settings.enquiriesBody')}
            checked={state.newInquiry}
            disabled={mutation.isPending}
            onChange={(value) => set('newInquiry', value)}
          />
          <Row
            title={t('selling.settings.moderation')}
            text={t('selling.settings.moderationBody')}
            checked={state.listingStatus}
            disabled={mutation.isPending}
            onChange={(value) => set('listingStatus', value)}
          />
          <Row
            title={t('selling.settings.weekly')}
            text={t('selling.settings.weeklyBody')}
            checked={state.performance}
            disabled={mutation.isPending}
            onChange={(value) => set('performance', value)}
          />
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="font-black">{t('selling.settings.storefront')}</h2>
        <div className="mt-3">
          <Row
            title={t('selling.settings.phone')}
            text={t('selling.settings.phoneBody')}
            checked={state.showPhone}
            disabled={mutation.isPending}
            onChange={(value) => set('showPhone', value)}
          />
          <Row
            title={t('selling.settings.vacation')}
            text={t('selling.settings.vacationBody')}
            checked={state.vacation}
            disabled={mutation.isPending}
            onChange={(value) => set('vacation', value)}
          />
          <Row
            title={t('selling.settings.renew')}
            text={t('selling.settings.renewBody')}
            checked={state.autoRenew}
            disabled={mutation.isPending}
            onChange={(value) => set('autoRenew', value)}
          />
        </div>
      </section>

      {saved && (
        <p
          className="rounded-xl bg-brand-50 p-3 text-sm font-semibold text-brand-800"
          role="status"
          aria-live="polite"
        >
          {t('selling.settings.saved')}
        </p>
      )}

      {mutation.isError && (
        <p className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700" role="alert">
          {mutation.error.message}
        </p>
      )}

      <Button
        className="w-full sm:w-auto"
        loading={mutation.isPending}
        disabled={mutation.isPending}
        onClick={() => mutation.mutate(state)}
      >
        {t('selling.settings.save')}
      </Button>
    </div>
  );
}

export default function SellerSettingsPage() {
  const { t } = useLocale();
  const settingsQuery = useQuery({
    queryKey: ['seller', 'settings'],
    queryFn: sellerService.getMySettings,
  });

  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
        <div className="mb-5 sm:mb-7">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-700">
            {t('selling.eyebrow')}
          </p>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            {t('selling.settings.title')}
          </h1>
          <p className="mt-1 text-slate-500">{t('selling.settings.body')}</p>
        </div>

        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <SellingSidebar />
          <div>
            {settingsQuery.isLoading && (
              <div className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-14 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            )}

            {settingsQuery.isError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
                <p className="text-sm font-semibold text-rose-800">{settingsQuery.error.message}</p>
                <Button className="mt-4" variant="outline" onClick={() => settingsQuery.refetch()}>
                  {t('common.tryAgain')}
                </Button>
              </div>
            )}

            {settingsQuery.data && (
              <SellerSettingsForm
                key={JSON.stringify(settingsQuery.data)}
                initialSettings={settingsQuery.data}
              />
            )}
          </div>
        </div>
      </main>
    </MarketplaceShell>
  );
}
