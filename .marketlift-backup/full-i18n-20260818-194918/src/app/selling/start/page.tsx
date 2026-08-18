'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, ShieldCheck, Store, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { MarketplaceShell } from '@/components/layout/marketplace-shell';
import { AccountSidebar } from '@/components/account/account-sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';

type SellingBenefit = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const benefits: SellingBenefit[] = [
  {
    icon: Store,
    title: 'Publish directly',
    description: 'Ordinary listings go live after automated validation.',
  },
  {
    icon: ShieldCheck,
    title: 'Build trust',
    description:
      'Identity verification remains optional for most categories and never exposes your CPF.',
  },
  {
    icon: TrendingUp,
    title: 'Grow when ready',
    description:
      'Start on Free and upgrade only when you need more capacity or visibility.',
  },
];

export default function StartSellingPage() {
  const { canSell, activateSelling } = useAuth();
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enableSelling = async () => {
    setActivating(true);
    setError(null);
    try {
      await activateSelling();
    } catch {
      setError('We could not enable selling right now. Please try again.');
    } finally {
      setActivating(false);
    }
  };

  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
        <div className="mb-5 sm:mb-7">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-700">
            My Marketlift
          </p>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            Start selling
          </h1>
          <p className="mt-1 text-slate-500">
            Selling is a feature of your existing Marketlift account—not a different account type.
          </p>
        </div>

        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <AccountSidebar />
          <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-8">
            {canSell ? (
              <div className="mx-auto max-w-xl py-8 text-center">
                <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-50 text-brand-700">
                  <CheckCircle2 className="size-9" />
                </span>
                <h2 className="mt-5 text-2xl font-black">Selling is already enabled</h2>
                <p className="mt-2 text-slate-500">
                  Use the same account to post listings, message buyers and manage your marketplace activity.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <Button asChild>
                    <Link href="/selling">Open Selling</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/selling/listings/new">Post a listing</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-8 xl:grid-cols-[1fr_330px]">
                <div>
                  <h2 className="text-2xl font-black">Start selling in minutes</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    No second registration, no seller login and no CPF just to create ordinary listings. We simply add selling tools to this account.
                  </p>

                  <div className="mt-7 grid gap-4 sm:grid-cols-3">
                    {benefits.map(({ icon: Icon, title, description }) => (
                      <div key={title} className="rounded-2xl border p-5">
                        <Icon className="size-6 text-brand-600" />
                        <h3 className="mt-3 font-black">{title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-7 rounded-2xl bg-slate-50 p-5">
                    <h3 className="font-black">How moderation works</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Most listings publish immediately. A listing is only held under review when automated safety checks, reports or future category rules identify additional risk.
                    </p>
                  </div>

                  {error && (
                    <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">
                      {error}
                    </p>
                  )}

                  <Button
                    className="mt-7 w-full sm:w-auto"
                    size="lg"
                    loading={activating}
                    loadingText="Enabling…"
                    onClick={enableSelling}
                  >
                    Enable selling
                  </Button>
                </div>

                <aside className="h-fit rounded-2xl border border-brand-100 bg-brand-50 p-5">
                  <p className="text-sm font-bold text-brand-800">Free plan</p>
                  <p className="mt-2 text-3xl font-black text-brand-950">R$0</p>
                  <p className="mt-1 text-sm text-brand-800">
                    Start with up to 5 active listings.
                  </p>
                  <p className="mt-4 text-xs leading-5 text-brand-800">
                    Plans affect listing capacity and promotional tools. They never create a separate seller account.
                  </p>
                </aside>
              </div>
            )}
          </section>
        </div>
      </main>
    </MarketplaceShell>
  );
}
