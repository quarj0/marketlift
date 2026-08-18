import Link from 'next/link';
import { BadgeCheck, LockKeyhole, MapPin, ShieldCheck } from 'lucide-react';
import { MarketliftLogo } from '@/components/marketplace/logo';

export function AuthShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <main id="main-content" className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(420px,.85fr)]">
      <section className="relative hidden overflow-hidden bg-[#06183a] p-10 text-white lg:flex lg:min-h-screen lg:flex-col lg:justify-between xl:p-14">
        <div className="absolute -right-20 top-20 size-72 rounded-full bg-cyan-400/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 left-20 size-80 rounded-full bg-orange-400/15 blur-3xl" aria-hidden="true" />
        <MarketliftLogo size="large" inverse />
        <div className="relative max-w-xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">Buy · Sell · Grow</p>
          <h2 className="mt-4 text-5xl font-black leading-[1.05] tracking-tight">Local commerce with clearer trust signals.</h2>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-300">Browse freely. Create an account only when you want to save, message, review or report.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[[ShieldCheck,'Seller verification'],[MapPin,'Location-first discovery'],[LockKeyhole,'Private account details'],[BadgeCheck,'Marketplace moderation']].map(([Icon,label])=>{const I=Icon as typeof ShieldCheck;return <div key={String(label)} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.06] p-4 text-sm font-bold"><I className="size-5 text-cyan-300"/>{String(label)}</div>})}
          </div>
        </div>
        <p className="relative text-xs leading-5 text-slate-400">Marketlift does not hold product payments or provide escrow in V1.</p>
      </section>

      <section className="flex min-h-screen flex-col">
        <div className="bg-[#06183a] px-4 pb-8 pt-5 lg:hidden">
          <div className="mx-auto flex max-w-xl items-center justify-between">
            <MarketliftLogo inverse />
            <Link href="/" className="rounded-xl border border-white/15 px-3 py-2 text-sm font-bold text-white">Browse</Link>
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
