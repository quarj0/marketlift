import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, Handshake, MapPin, MessageCircle, ShieldCheck } from 'lucide-react';
import { MarketplaceShell } from '@/components/layout/marketplace-shell';
import { T } from '@/components/i18n/t';

export const instant = false;

const tips: Array<{ icon: LucideIcon; title: string; body: string }> = [
  { icon: MapPin, title: 'safety.tip.meet', body: 'safety.tip.meetBody' },
  { icon: Handshake, title: 'safety.tip.pay', body: 'safety.tip.payBody' },
  { icon: ShieldCheck, title: 'safety.tip.profile', body: 'safety.tip.profileBody' },
  { icon: MessageCircle, title: 'safety.tip.chat', body: 'safety.tip.chatBody' },
  { icon: AlertTriangle, title: 'safety.tip.report', body: 'safety.tip.reportBody' },
];

export default function Safety() {
  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm font-bold uppercase tracking-wider text-brand-700"><T id="home.tradeConfidence" /></p>
        <h1 className="mt-2 text-4xl font-black"><T id="safety.title" /></h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600"><T id="safety.intro" /></p>
        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          {tips.map(({ icon: Icon, title, body }) => (
            <article key={title} className="rounded-2xl border bg-white p-6 shadow-sm">
              <Icon className="size-7 text-brand-600" />
              <h2 className="mt-4 text-lg font-black"><T id={title} /></h2>
              <p className="mt-2 text-sm leading-6 text-slate-500"><T id={body} /></p>
            </article>
          ))}
        </div>
        <div className="mt-8 rounded-2xl bg-amber-50 p-5 text-sm leading-6 text-amber-950">
          <b><T id="safety.important" /></b>{' '}<T id="safety.importantBody" />
        </div>
      </main>
    </MarketplaceShell>
  );
}
