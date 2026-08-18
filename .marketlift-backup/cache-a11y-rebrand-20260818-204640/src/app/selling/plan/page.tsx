import {MarketplaceShell} from '@/components/layout/marketplace-shell';import {T} from '@/components/i18n/t';import {SellingSidebar} from '@/components/selling/selling-sidebar';import {PlanClient} from '@/components/payments/plan-client';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function SellerPlanPage(){return <MarketplaceShell><main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10"><div className="mb-5 sm:mb-7"><p className="text-sm font-bold uppercase tracking-wider text-brand-700"><T id="selling.eyebrow" /></p><h1 className="text-2xl font-black tracking-tight sm:text-3xl"><T id="selling.plan.title" /></h1><p className="mt-1 text-slate-500"><T id="selling.plan.body" /></p></div><div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[230px_minmax(0,1fr)]"><SellingSidebar/><PlanClient/></div></main></MarketplaceShell>}
