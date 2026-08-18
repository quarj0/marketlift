import { MarketplaceShell } from '@/components/layout/marketplace-shell';
import { T } from '@/components/i18n/t';

export const instant = false;

const sections = [
  ['terms.using', 'terms.usingBody'],
  ['terms.accounts', 'terms.accountsBody'],
  ['terms.services', 'terms.servicesBody'],
  ['terms.moderation', 'terms.moderationBody'],
  ['terms.limitation', 'terms.limitationBody'],
] as const;

export default function Page() {
  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border bg-white p-7 shadow-sm sm:p-10">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-700">Marketlift · K&amp;C</p>
          <h1 className="mt-2 text-4xl font-black"><T id="terms.title" /></h1>
          <p className="mt-2 text-sm text-slate-400"><T id="legal.draft" /></p>
          <div className="mt-8">
            {sections.map(([title, body]) => (
              <section key={title} className="border-t py-6 first:border-0 first:pt-0">
                <h2 className="text-lg font-black"><T id={title} /></h2>
                <p className="mt-2 text-sm leading-7 text-slate-600"><T id={body} /></p>
              </section>
            ))}
          </div>
        </div>
      </main>
    </MarketplaceShell>
  );
}
