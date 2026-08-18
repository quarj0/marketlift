'use client';

import Link from 'next/link';
import { BadgeCheck, LockKeyhole, MapPin, ShieldCheck } from 'lucide-react';

import { MarketliftLogo } from '@/components/marketplace/logo';
import { LanguageSwitcher } from '@/components/i18n/language-switcher';
import { useLocale } from '@/providers/locale-provider';

export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  const { t } = useLocale();

  const signals = [
    [ShieldCheck, t('auth.sellerVerification')],
    [MapPin, t('auth.locationFirst')],
    [LockKeyhole, t('auth.privateDetails')],
    [BadgeCheck, t('auth.moderation')],
  ] as const;

  return (
    <main id="main-content" className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(420px,.85fr)]">
      <section className="relative hidden overflow-hidden bg-[#02122f] p-10 text-white lg:flex lg:min-h-screen lg:flex-col lg:justify-between xl:p-14">
        <div className="absolute -right-20 top-20 size-72 rounded-full bg-cyan-400/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 left-20 size-80 rounded-full bg-lift-400/10 blur-3xl" aria-hidden="true" />

        <div className="relative flex items-center justify-between gap-4">
          <MarketliftLogo size="large" inverse />
          <LanguageSwitcher inverse />
        </div>

        <div className="relative max-w-xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">
            {t('auth.tagline')}
          </p>
          <h2 className="mt-4 text-5xl font-black leading-[1.05] tracking-tight">
            {t('auth.sideTitle')}
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-300">
            {t('auth.sideBody')}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {signals.map(([Icon, label]) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.06] p-4 text-sm font-bold"
              >
                <Icon className="size-5 text-cyan-300" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs leading-5 text-slate-400">
          {t('auth.noEscrow')}
        </p>
      </section>

      <section className="flex min-h-screen flex-col">
        <div className="bg-[#02122f] px-4 pb-8 pt-5 lg:hidden">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-2">
            <MarketliftLogo inverse />

            <div className="flex items-center gap-2">
              <LanguageSwitcher compact inverse />
              <Link href="/" className="inline-flex min-h-11 items-center rounded-xl border border-white/15 px-3 py-2 text-sm font-bold text-white focus-visible:ring-2 focus-visible:ring-white">
                {t('auth.browse')}
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-7 max-w-xl text-white">
            <h1 className="text-3xl font-black tracking-tight">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">{subtitle}</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-6 sm:px-8 lg:py-12">
          <div className="w-full max-w-xl">
            <div className="hidden lg:block">
              <h1 className="text-4xl font-black tracking-tight text-slate-950">{title}</h1>
              <p className="mt-3 text-base leading-7 text-slate-600">{subtitle}</p>
            </div>

            <div className="-mt-4 rounded-3xl border bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-7 lg:mt-8 lg:shadow-sm">
              {children}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
