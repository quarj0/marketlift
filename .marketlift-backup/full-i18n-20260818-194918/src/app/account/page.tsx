import {MarketplaceShell} from '@/components/layout/marketplace-shell';import {AccountSidebar} from '@/components/account/account-sidebar';import {AccountOverview} from '@/components/account/account-overview';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function AccountPage(){return <MarketplaceShell><main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10"><div className="mb-5 sm:mb-7"><p className="text-sm font-bold uppercase tracking-wider text-brand-700">My Marketlift</p><h1 className="text-2xl font-black tracking-tight sm:text-3xl">Your account</h1><p className="mt-1 text-slate-500">Saved items, conversations and account activity in one place.</p></div><div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[230px_minmax(0,1fr)]"><AccountSidebar/><AccountOverview/></div></main></MarketplaceShell>}
