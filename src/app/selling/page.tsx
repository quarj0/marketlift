import Link from 'next/link';
import { Plus } from 'lucide-react';
import { MarketplaceShell } from '@/components/layout/marketplace-shell';
import { SellingSidebar } from '@/components/selling/selling-sidebar';
import { SellingDashboardClient } from '@/components/selling/selling-dashboard-client';
import { Button } from '@/components/ui/button';
import { T } from '@/components/i18n/t';

export default function SellingPage() {
  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
        <div className="mb-5 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[.14em] text-brand-700 sm:text-sm"><T id="selling.eyebrow" /></p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl"><T id="selling.dashboard.title" /></h1>
            <p className="mt-1 text-sm leading-6 text-slate-500 sm:text-base"><T id="selling.dashboard.body" /></p>
          </div>
          <Button asChild className="w-full sm:w-auto"><Link href="/selling/listings/new"><Plus className="size-4" /><T id="selling.addListing" /></Link></Button>
        </div>
        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[230px_minmax(0,1fr)]"><SellingSidebar /><SellingDashboardClient /></div>
      </main>
    </MarketplaceShell>
  );
}
