"use client";

import Image from "next/image";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, Save, ShoppingBag, Store } from "lucide-react";

import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { SellingSidebar } from "@/components/selling/selling-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, InlineError, PageLoading } from "@/components/feedback/async-states";
import { sellingService } from "@/services/selling.service";
import { commerceService, type CategoryCommercePolicy, type ListingCommerce } from "@/services/commerce.service";
import type { SellerListing } from "@/types";
import { useMarket } from "@/providers/market-provider";

function Configurator({ listing, policy, commerce }: { listing: SellerListing; policy: CategoryCommercePolicy; commerce: ListingCommerce }) {
  const queryClient = useQueryClient();
  const { formatMoney } = useMarket();
  const [enabled, setEnabled] = useState(commerce.checkoutEnabled || commerce.reasons.includes("seller_payments_not_active"));
  const [stock, setStock] = useState(Math.max(1, commerce.stockQuantity || 1));
  const [shipping, setShipping] = useState(commerce.fulfillmentMethods.includes("shipping"));
  const [localDelivery, setLocalDelivery] = useState(commerce.fulfillmentMethods.includes("local_delivery"));
  const [pickup, setPickup] = useState(commerce.fulfillmentMethods.includes("pickup") || policy.pickupAllowed);
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  const save = useMutation({
    mutationFn: () => commerceService.configureListing({
      listingId: listing.id,
      checkoutEnabled: enabled,
      stockQuantity: stock,
      shippingEnabled: enabled && shipping,
      localDeliveryEnabled: enabled && localDelivery,
      pickupEnabled: enabled && pickup,
      packageWeightGrams: shipping && weight ? Number(weight) : undefined,
      packageLengthCm: shipping && length ? Number(length) : undefined,
      packageWidthCm: shipping && width ? Number(width) : undefined,
      packageHeightCm: shipping && height ? Number(height) : undefined,
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["seller-commerce", listing.id] }),
  });

  if (policy.mode === "disabled") {
    return (
      <article className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="flex gap-4"><div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100"><Image src={listing.images[0]} alt="" fill className="object-cover" /></div><div className="min-w-0"><h2 className="line-clamp-2 font-black">{listing.title}</h2><p className="mt-1 font-black text-brand-700">{formatMoney(listing.price)}</p><span className="mt-2 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black">Classificado somente</span></div></div>
        <p className="mt-4 text-sm text-slate-500">Esta categoria exige contato/inspeção antes do pagamento. O checkout não pode ser habilitado para este anúncio.</p>
      </article>
    );
  }

  return (
    <article className="rounded-3xl border bg-white p-5 shadow-sm">
      <div className="flex gap-4"><div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100"><Image src={listing.images[0]} alt="" fill className="object-cover" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="line-clamp-2 font-black">{listing.title}</h2><p className="mt-1 font-black text-brand-700">{formatMoney(listing.price)}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-black ${policy.mode === "enabled" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{policy.mode === "enabled" ? "Checkout permitido" : "Checkout opcional"}</span></div></div></div>

      <label className="mt-5 flex items-center justify-between gap-4 rounded-2xl border p-4"><span><strong className="block">Aceitar compra online</strong><span className="text-xs text-slate-500">{policy.mode === "optional" ? "O comprador ainda poderá preferir inspeção/chat." : "O comprador poderá pagar e solicitar entrega."}</span></span><input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="size-5 accent-brand-600" /></label>

      {enabled && <>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-bold">Estoque<Input className="mt-1" type="number" min="0" value={stock} onChange={(e) => setStock(Number(e.target.value))} /></label>
          <div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-600"><strong>Proteção de categoria</strong><p className="mt-1">O administrador define quais métodos podem ser usados. O vendedor só escolhe dentro dessas regras.</p></div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {policy.shippingAllowed && <label className="flex items-center gap-2 rounded-xl border p-3 text-sm font-bold"><input type="checkbox" checked={shipping} onChange={(e) => setShipping(e.target.checked)} /> Envio</label>}
          {policy.localDeliveryAllowed && <label className="flex items-center gap-2 rounded-xl border p-3 text-sm font-bold"><input type="checkbox" checked={localDelivery} onChange={(e) => setLocalDelivery(e.target.checked)} /> Entrega local</label>}
          {policy.pickupAllowed && <label className="flex items-center gap-2 rounded-xl border p-3 text-sm font-bold"><input type="checkbox" checked={pickup} onChange={(e) => setPickup(e.target.checked)} /> Retirada</label>}
        </div>
        {shipping && <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"><Input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Peso (g)" type="number" /><Input value={length} onChange={(e) => setLength(e.target.value)} placeholder="Compr. cm" type="number" /><Input value={width} onChange={(e) => setWidth(e.target.value)} placeholder="Larg. cm" type="number" /><Input value={height} onChange={(e) => setHeight(e.target.value)} placeholder="Alt. cm" type="number" /></div>}
      </>}

      {save.isError && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{save.error instanceof Error ? save.error.message : "Não foi possível salvar."}</p>}
      {save.isSuccess && <p className="mt-4 text-sm font-bold text-emerald-700">Configuração salva.</p>}
      <Button className="mt-4" onClick={() => save.mutate()} disabled={save.isPending}><Save className="size-4" /> Salvar venda online</Button>
    </article>
  );
}

function ListingCommerceCard({ listing }: { listing: SellerListing }) {
  const policyQuery = useQuery({ queryKey: ["category-commerce", listing.category], queryFn: () => commerceService.getCategoryPolicy(listing.category), staleTime: 60_000 });
  const commerceQuery = useQuery({ queryKey: ["seller-commerce", listing.id], queryFn: () => commerceService.getListingCommerce(listing.id) });
  if (policyQuery.isLoading || commerceQuery.isLoading) return <div className="h-48 animate-pulse rounded-3xl border bg-white" />;
  if (!policyQuery.data || !commerceQuery.data) return <div className="rounded-3xl border bg-white p-5 text-sm text-slate-500">Não foi possível carregar a política deste anúncio.</div>;
  return <Configurator key={`${listing.id}:${commerceQuery.data.stockQuantity}:${commerceQuery.data.fulfillmentMethods.join(",")}:${commerceQuery.data.checkoutEnabled}`} listing={listing} policy={policyQuery.data} commerce={commerceQuery.data} />;
}

export default function OnlineSalesPage() {
  const listingsQuery = useQuery({ queryKey: ["seller-listings-online-sales"], queryFn: sellingService.getListings });
  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
        <div className="mb-5"><p className="text-xs font-black uppercase tracking-[.14em] text-brand-700">Vendas</p><h1 className="mt-1 text-3xl font-black">Vendas online</h1><p className="mt-1 text-sm text-slate-500">Ative checkout somente nos anúncios permitidos pela categoria e escolha estoque e entrega.</p></div>
        <div className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]"><SellingSidebar /><section className="min-w-0">
          <div className="mb-4 flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-950"><ShoppingBag className="mt-0.5 size-5 shrink-0" /><p><strong>Híbrido por design.</strong> Carros, imóveis e outras categorias de inspeção continuam classificados. Produtos elegíveis podem ter checkout obrigatório ou opcional conforme a política do Marketlift.</p></div>
          {listingsQuery.isLoading && <PageLoading label="Carregando anúncios..." />}
          {listingsQuery.isError && <InlineError title="Não foi possível carregar seus anúncios" description="Tente novamente." onRetry={() => listingsQuery.refetch()} />}
          {!listingsQuery.isLoading && !listingsQuery.isError && listingsQuery.data?.length === 0 && <EmptyState title="Nenhum anúncio" description="Publique um anúncio antes de configurar vendas online." href="/selling/listings/new" action="Criar anúncio" />}
          {!!listingsQuery.data?.length && <div className="space-y-4">{listingsQuery.data.filter((listing) => listing.status === "published").map((listing) => <ListingCommerceCard key={listing.id} listing={listing} />)}</div>}
        </section></div>
      </main>
    </MarketplaceShell>
  );
}
