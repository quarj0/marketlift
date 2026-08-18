import { Home, Search, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { MarketplaceShell } from '@/components/layout/marketplace-shell';
import { Button } from '@/components/ui/button';
import { T } from '@/components/i18n/t';

export default function NotFound() {
  return (
    <MarketplaceShell>
      <main className="mx-auto flex min-h-[68vh] max-w-5xl items-center justify-center px-4 py-14 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl text-center">
          <div className="relative mx-auto mb-7 flex h-28 w-44 items-center justify-center">
            <span className="select-none text-8xl font-black tracking-tighter text-brand-100">404</span>
            <div className="absolute flex size-14 items-center justify-center rounded-2xl border bg-white shadow-soft"><Search className="size-7 text-brand-700" /></div>
          </div>
          <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-brand-700"><T id="notFound.eyebrow" /></p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl"><T id="notFound.title" /></h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-500 sm:text-base"><T id="notFound.body" /></p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg"><Link href="/"><Home className="size-4" /><T id="notFound.home" /></Link></Button>
            <Button asChild size="lg" variant="outline"><Link href="/search"><Search className="size-4" /><T id="notFound.search" /></Link></Button>
          </div>
          <div className="mx-auto mt-10 flex max-w-lg items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-left">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-700" />
            <p className="text-sm leading-6 text-emerald-900"><strong><T id="notFound.listing" /></strong>{' '}<T id="notFound.listingBody" /></p>
          </div>
        </div>
      </main>
    </MarketplaceShell>
  );
}
