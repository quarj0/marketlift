'use client';

import { useState } from 'react';
import { MarketplaceShell } from '@/components/layout/marketplace-shell';
import { SellingSidebar } from '@/components/selling/selling-sidebar';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/providers/locale-provider';

function Row({ title, text, checked, onChange }: { title: string; text: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-start justify-between gap-4 border-b py-4 last:border-0"><span><b className="block text-sm">{title}</b><span className="mt-1 block text-xs leading-5 text-slate-500">{text}</span></span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 size-5 accent-brand-600" /></label>;
}

export default function SellerSettings() {
  const { t } = useLocale();
  const [state, setState] = useState({ newInquiry: true, listingStatus: true, performance: true, autoRenew: false, showPhone: true, vacation: false });
  const [saved, setSaved] = useState(false);
  const set = (key: keyof typeof state, value: boolean) => setState((current) => ({ ...current, [key]: value }));

  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
        <div className="mb-5 sm:mb-7"><p className="text-sm font-bold uppercase tracking-wider text-brand-700">{t('selling.eyebrow')}</p><h1 className="text-2xl font-black tracking-tight sm:text-3xl">{t('selling.settings.title')}</h1><p className="mt-1 text-slate-500">{t('selling.settings.body')}</p></div>
        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <SellingSidebar />
          <div className="space-y-6">
            <section className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="font-black">{t('selling.settings.notifications')}</h2><div className="mt-3"><Row title={t('selling.settings.enquiries')} text={t('selling.settings.enquiriesBody')} checked={state.newInquiry} onChange={(value) => set('newInquiry', value)} /><Row title={t('selling.settings.moderation')} text={t('selling.settings.moderationBody')} checked={state.listingStatus} onChange={(value) => set('listingStatus', value)} /><Row title={t('selling.settings.weekly')} text={t('selling.settings.weeklyBody')} checked={state.performance} onChange={(value) => set('performance', value)} /></div></section>
            <section className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="font-black">{t('selling.settings.storefront')}</h2><div className="mt-3"><Row title={t('selling.settings.phone')} text={t('selling.settings.phoneBody')} checked={state.showPhone} onChange={(value) => set('showPhone', value)} /><Row title={t('selling.settings.vacation')} text={t('selling.settings.vacationBody')} checked={state.vacation} onChange={(value) => set('vacation', value)} /><Row title={t('selling.settings.renew')} text={t('selling.settings.renewBody')} checked={state.autoRenew} onChange={(value) => set('autoRenew', value)} /></div></section>
            {saved && <p className="rounded-xl bg-brand-50 p-3 text-sm font-semibold text-brand-800" role="status" aria-live="polite">{t('selling.settings.saved')}</p>}
            <Button className="w-full sm:w-auto" onClick={() => setSaved(true)}>{t('selling.settings.save')}</Button>
          </div>
        </div>
      </main>
    </MarketplaceShell>
  );
}
