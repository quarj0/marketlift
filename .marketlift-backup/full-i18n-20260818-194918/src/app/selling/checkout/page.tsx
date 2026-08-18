import {Suspense} from 'react';import {MarketplaceShell} from '@/components/layout/marketplace-shell';import {SellingSidebar} from '@/components/selling/selling-sidebar';import {CheckoutClient} from '@/components/payments/checkout-client';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function CheckoutPage(){return <MarketplaceShell><main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10"><div className="mb-5 sm:mb-7"><p className="text-sm font-bold uppercase tracking-wider text-brand-700">Selling</p><h1 className="text-2xl font-black tracking-tight sm:text-3xl">Checkout</h1></div><div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[230px_minmax(0,1fr)]"><SellingSidebar/><Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-slate-100"/>}><CheckoutClient/></Suspense></div></main></MarketplaceShell>}
