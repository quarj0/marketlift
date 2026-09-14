"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, ShoppingBag } from "lucide-react";

import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { SellingSidebar } from "@/components/selling/selling-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, InlineError, PageLoading } from "@/components/feedback/async-states";
import { sellingService } from "@/services/selling.service";
import { commerceService, type CategoryCommercePolicy, type ListingCommerce } from "@/services/commerce.service";
import type { SellerListing } from "@/types";
import { useMarket } from "@/providers/market-provider";
import { useLocale } from "@/providers/locale-provider";

function Configurator({ listing, policy, commerce }: { listing: SellerListing; policy: CategoryCommercePolicy; commerce: ListingCommerce }) {
  const queryClient = useQueryClient();
  const { formatMoney } = useMarket();
  const { locale } = useLocale();
  const [enabled, setEnabled] = useState(commerce.checkoutEnabled || commerce.reasons.includes("seller_payments_not_active"));
  const [stock, setStock] = useState(commerce.stockQuantity);
  const [shipping, setShipping] = useState(commerce.fulfillmentMethods.includes("shipping"));
  const [localDelivery, setLocalDelivery] = useState(commerce.fulfillmentMethods.includes("local_delivery"));
  const [pickup, setPickup] = useState(commerce.fulfillmentMethods.includes("pickup"));
  const [weight, setWeight] = useState(String(commerce.packageWeightGrams ?? ""));
  const [length, setLength] = useState(String(commerce.packageLengthCm ?? ""));
  const [width, setWidth] = useState(String(commerce.packageWidthCm ?? ""));
  const [height, setHeight] = useState(String(commerce.packageHeightCm ?? ""));

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
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["seller-commerce", listing.id] }),
        queryClient.invalidateQueries({ queryKey: ["listing-commerce", listing.id] }),
      ]);
    },
  });

  if (policy.mode === "disabled") {
    return (
      <article className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="flex gap-4"><div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100"><Image src={listing.images[0]} alt="" fill className="object-cover" /></div><div className="min-w-0"><h2 className="line-clamp-2 font-black">{listing.title}</h2><p className="mt-1 font-black text-brand-700">{formatMoney(listing.price)}</p><span className="mt-2 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black">{locale === "pt-BR" ? "Classificado somente" : "Classified only"}</span></div></div>
        <p className="mt-4 text-sm text-slate-500">{locale === "pt-BR" ? "Esta categoria exige contato/inspeção antes do pagamento. O checkout não pode ser habilitado para este anúncio." : "This category requires contact or inspection before payment, so checkout cannot be enabled for this listing."}</p>
      </article>
    );
  }

  return (
    <article className="rounded-3xl border bg-white p-5 shadow-sm">
      <div className="flex gap-4"><div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100"><Image src={listing.images[0]} alt="" fill className="object-cover" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="line-clamp-2 font-black">{listing.title}</h2><p className="mt-1 font-black text-brand-700">{formatMoney(listing.price)}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-black ${policy.mode === "enabled" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{policy.mode === "enabled" ? (locale === "pt-BR" ? "Checkout permitido" : "Checkout enabled") : (locale === "pt-BR" ? "Checkout opcional" : "Optional checkout")}</span></div></div></div>

      <label className="mt-5 flex items-center justify-between gap-4 rounded-2xl border p-4"><span><strong className="block">{locale === "pt-BR" ? "Aceitar compra online" : "Accept online purchase"}</strong><span className="text-xs text-slate-500">{policy.mode === "optional" ? (locale === "pt-BR" ? "O comprador ainda poderá preferir inspeção/chat." : "The buyer can still choose inspection/chat.") : (locale === "pt-BR" ? "O comprador poderá pagar e solicitar entrega." : "The buyer can pay and request fulfillment.")}</span></span><input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="size-5 accent-brand-600" /></label>

      {enabled && <>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-bold">{locale === "pt-BR" ? "Estoque" : "Stock"}<Input className="mt-1" type="number" min="0" value={stock} onChange={(e) => setStock(Number(e.target.value))} /></label>
          <div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-600"><strong>{locale === "pt-BR" ? "Proteção de categoria" : "Category protection"}</strong><p className="mt-1">{locale === "pt-BR" ? "O administrador define quais métodos podem ser usados. O vendedor só escolhe dentro dessas regras." : "Administrators define the allowed methods; sellers choose only within those rules."}</p></div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {policy.shippingAllowed && <label className="flex items-center gap-2 rounded-xl border p-3 text-sm font-bold"><input type="checkbox" checked={shipping} onChange={(e) => setShipping(e.target.checked)} /> {locale === "pt-BR" ? "Envio" : "Shipping"}</label>}
          {policy.localDeliveryAllowed && <label className="flex items-center gap-2 rounded-xl border p-3 text-sm font-bold"><input type="checkbox" checked={localDelivery} onChange={(e) => setLocalDelivery(e.target.checked)} /> {locale === "pt-BR" ? "Entrega local" : "Local delivery"}</label>}
          {policy.pickupAllowed && <label className="flex items-center gap-2 rounded-xl border p-3 text-sm font-bold"><input type="checkbox" checked={pickup} onChange={(e) => setPickup(e.target.checked)} /> {locale === "pt-BR" ? "Retirada" : "Pickup"}</label>}
        </div>
        {shipping && <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"><Input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={locale === "pt-BR" ? "Peso (g)" : "Weight (g)"} type="number" /><Input value={length} onChange={(e) => setLength(e.target.value)} placeholder={locale === "pt-BR" ? "Compr. cm" : "Length cm"} type="number" /><Input value={width} onChange={(e) => setWidth(e.target.value)} placeholder={locale === "pt-BR" ? "Larg. cm" : "Width cm"} type="number" /><Input value={height} onChange={(e) => setHeight(e.target.value)} placeholder={locale === "pt-BR" ? "Alt. cm" : "Height cm"} type="number" /></div>}
      </>}

      {save.isError && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{save.error instanceof Error ? save.error.message : (locale === "pt-BR" ? "Não foi possível salvar." : "Could not save.")}</p>}
      {save.isSuccess && <p className="mt-4 text-sm font-bold text-emerald-700">{locale === "pt-BR" ? "Configuração salva." : "Configuration saved."}</p>}
      <Button className="mt-4" onClick={() => save.mutate()} disabled={save.isPending}><Save className="size-4" /> {locale === "pt-BR" ? "Salvar venda online" : "Save online sale"}</Button>
    </article>
  );
}

function ListingCommerceCard({ listing }: { listing: SellerListing }) {
  const { locale } = useLocale();
  const policyQuery = useQuery({ queryKey: ["category-commerce", listing.category], queryFn: () => commerceService.getCategoryPolicy(listing.category), staleTime: 60_000 });
  const commerceQuery = useQuery({ queryKey: ["seller-commerce", listing.id], queryFn: () => commerceService.getListingCommerce(listing.id) });
  if (policyQuery.isLoading || commerceQuery.isLoading) return <div className="h-48 animate-pulse rounded-3xl border bg-white" />;
  if (!policyQuery.data || !commerceQuery.data) return <div className="rounded-3xl border bg-white p-5 text-sm text-slate-500">{locale === "pt-BR" ? "Não foi possível carregar a política deste anúncio." : "The policy for this listing could not be loaded."}</div>;
  const commerce = commerceQuery.data;
  const configKey = [
    listing.id,
    commerce.stockQuantity,
    commerce.fulfillmentMethods.join(","),
    commerce.checkoutEnabled,
    commerce.packageWeightGrams ?? "",
    commerce.packageLengthCm ?? "",
    commerce.packageWidthCm ?? "",
    commerce.packageHeightCm ?? "",
  ].join(":");
  return <Configurator key={configKey} listing={listing} policy={policyQuery.data} commerce={commerce} />;
}

export default function OnlineSalesPage() {
  const { locale } = useLocale();
  const listingsQuery = useQuery({ queryKey: ["seller-listings-online-sales"], queryFn: sellingService.getListings });
  const publishedListings = useMemo(() => (listingsQuery.data || []).filter((listing) => listing.status === "published"), [listingsQuery.data]);
  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
        <div className="mb-5"><p className="text-xs font-black uppercase tracking-[.14em] text-brand-700">{locale === "pt-BR" ? "Vendas" : "Sales"}</p><h1 className="mt-1 text-3xl font-black">{locale === "pt-BR" ? "Vendas online" : "Online sales"}</h1><p className="mt-1 text-sm text-slate-500">{locale === "pt-BR" ? "Ative checkout somente nos anúncios permitidos pela categoria e escolha estoque e entrega." : "Enable checkout only for category-eligible listings and choose stock and fulfillment."}</p></div>
        <div className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]"><SellingSidebar /><section className="min-w-0">
          <div className="mb-4 flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-950"><ShoppingBag className="mt-0.5 size-5 shrink-0" /><p><strong>{locale === "pt-BR" ? "Híbrido por design." : "Hybrid by design."}</strong> {locale === "pt-BR" ? "Carros, imóveis e outras categorias de inspeção continuam classificados. Produtos elegíveis podem ter checkout obrigatório ou opcional conforme a política do Marketlift." : "Cars, property and inspection-heavy categories remain classifieds. Eligible products can use required or optional checkout according to Marketlift policy."}</p></div>
          {listingsQuery.isLoading && <PageLoading label={locale === "pt-BR" ? "Carregando anúncios..." : "Loading listings..."} />}
          {listingsQuery.isError && <InlineError title={locale === "pt-BR" ? "Não foi possível carregar seus anúncios" : "Your listings could not be loaded"} description={locale === "pt-BR" ? "Tente novamente." : "Please try again."} onRetry={() => listingsQuery.refetch()} />}
          {!listingsQuery.isLoading && !listingsQuery.isError && publishedListings.length === 0 && <EmptyState title={locale === "pt-BR" ? "Nenhum anúncio publicado" : "No published listings"} description={locale === "pt-BR" ? "Publique um anúncio antes de configurar vendas online." : "Publish a listing before configuring online sales."} href="/selling/listings/new" action={locale === "pt-BR" ? "Criar anúncio" : "Create listing"} />}
          {publishedListings.length > 0 && <div className="space-y-4">{publishedListings.map((listing) => <ListingCommerceCard key={listing.id} listing={listing} />)}</div>}
        </section></div>
      </main>
    </MarketplaceShell>
  );
}