'use client';

import Image from 'next/image';
import { useState } from 'react';
import { BadgeCheck, Camera, Eye } from 'lucide-react';
import { MarketplaceShell } from '@/components/layout/marketplace-shell';
import { SellingSidebar } from '@/components/selling/selling-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/providers/locale-provider';

export default function SellingProfilePage() {
  const { t } = useLocale();
  const [saved, setSaved] = useState(false);

  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
        <div className="mb-5 sm:mb-7">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-700">{t('selling.eyebrow')}</p>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{t('selling.profile.title')}</h1>
          <p className="mt-1 text-slate-500">{t('selling.profile.body')}</p>
        </div>
        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <SellingSidebar />
          <div className="space-y-6">
            <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative w-fit">
                  <Image src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" alt={t('selling.profile.avatar')} width={96} height={96} unoptimized className="size-24 rounded-3xl object-cover" />
                  <button type="button" aria-label={t('selling.profile.photo')} className="absolute -bottom-2 -right-2 grid size-11 place-items-center rounded-full border bg-white shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"><Camera className="size-4" /></button>
                </div>
                <div>
                  <div className="flex items-center gap-2"><h2 className="text-xl font-black">Lucas Martins</h2><BadgeCheck className="size-5 text-brand-600" aria-label={t('selling.profile.verified')} /></div>
                  <p className="mt-1 text-sm text-slate-500">{t('selling.profile.summary')}</p>
                  <Button variant="outline" size="sm" className="mt-3"><Eye className="size-4" />{t('selling.profile.preview')}</Button>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-black">{t('selling.profile.public')}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-bold">{t('selling.profile.displayName')}</span><Input defaultValue="Lucas Martins" /></label>
                <label><span className="mb-1.5 block text-sm font-bold">{t('selling.profile.type')}</span><select className="h-11 w-full rounded-xl border bg-white px-3 text-sm"><option>{t('selling.profile.individual')}</option><option>{t('selling.profile.business')}</option></select></label>
                <label><span className="mb-1.5 block text-sm font-bold">{t('selling.profile.phone')}</span><Input defaultValue="+55 11 99999-4321" /></label>
                <label><span className="mb-1.5 block text-sm font-bold">{t('selling.profile.city')}</span><Input defaultValue="São Paulo" /></label>
                <label><span className="mb-1.5 block text-sm font-bold">{t('selling.profile.state')}</span><Input defaultValue="SP" /></label>
                <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-bold">{t('selling.profile.about')}</span><textarea defaultValue="Local Marketlift member selling well-described items around São Paulo." className="min-h-32 w-full rounded-xl border p-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" /></label>
              </div>
              {saved && <p className="mt-4 rounded-xl bg-brand-50 p-3 text-sm font-semibold text-brand-800" role="status" aria-live="polite">{t('selling.profile.saved')}</p>}
              <Button className="mt-5 w-full sm:w-auto" onClick={() => setSaved(true)}>{t('selling.profile.save')}</Button>
            </section>
          </div>
        </div>
      </main>
    </MarketplaceShell>
  );
}
