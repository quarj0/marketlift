'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { MarketplaceShell } from '@/components/layout/marketplace-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/providers/locale-provider';

export default function ReportProblem() {
  const [done, setDone] = useState(false);
  const { t } = useLocale();
  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {done ? (
          <div className="rounded-3xl border bg-white p-10 text-center shadow-sm">
            <CheckCircle2 className="mx-auto size-12 text-brand-600" />
            <h1 className="mt-4 text-2xl font-black">{t('help.report.received')}</h1>
            <p className="mt-2 text-slate-500">{t('help.report.receivedBody')}</p>
            <Button className="mt-6" onClick={() => setDone(false)}>{t('help.report.another')}</Button>
          </div>
        ) : (
          <div className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-bold uppercase tracking-wider text-brand-700">{t('help.eyebrow')}</p>
            <h1 className="mt-2 text-3xl font-black">{t('help.report')}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">{t('help.report.body')}</p>
            <div className="mt-7 space-y-4">
              <label><span className="mb-1.5 block text-sm font-bold">{t('help.report.topic')}</span>
                <select className="h-11 w-full rounded-xl border bg-white px-3 text-sm">
                  {['account','payment','moderation','safety','technical','other'].map((key) => <option key={key}>{t(`help.report.topic.${key}`)}</option>)}
                </select>
              </label>
              <label><span className="mb-1.5 block text-sm font-bold">{t('help.report.email')}</span><Input type="email" placeholder="you@example.com" /></label>
              <label><span className="mb-1.5 block text-sm font-bold">{t('help.report.subject')}</span><Input placeholder={t('help.report.subjectPlaceholder')} /></label>
              <label><span className="mb-1.5 block text-sm font-bold">{t('help.report.details')}</span><textarea className="min-h-40 w-full rounded-xl border p-3 text-sm" placeholder={t('help.report.detailsPlaceholder')} /></label>
              <Button onClick={() => setDone(true)}>{t('help.report.submit')}</Button>
            </div>
          </div>
        )}
      </main>
    </MarketplaceShell>
  );
}
