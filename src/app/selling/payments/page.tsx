"use client";

import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { SellingSidebar } from "@/components/selling/selling-sidebar";
import { SellerPaymentsClient } from "@/components/commerce/seller-payments-client";

export default function PaymentsPage() {
  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
        <div className="mb-5 sm:mb-7">
          <p className="text-xs font-black uppercase tracking-[.14em] text-brand-700 sm:text-sm">Vendas</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Marketlift Payments</h1>
          <p className="mt-1 text-sm leading-6 text-slate-500 sm:text-base">Ative recebimentos, acompanhe valores pendentes e disponíveis e solicite seus saques.</p>
        </div>
        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <SellingSidebar />
          <section className="min-w-0"><SellerPaymentsClient /></section>
        </div>
      </main>
    </MarketplaceShell>
  );
}
