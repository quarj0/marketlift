"use client";

import Image from "next/image";
import { useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, CheckCircle2, MapPin, PackageCheck, Truck } from "lucide-react";

import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { SellingSidebar } from "@/components/selling/selling-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, InlineError, PageLoading } from "@/components/feedback/async-states";
import { commerceService, type CommerceOrder } from "@/services/commerce.service";
import { useMarket } from "@/providers/market-provider";
import { useLocale } from "@/providers/locale-provider";

const PAGE_SIZE = 50;

function addressLine(address: Record<string, unknown>) {
  const street = String(address.street || "");
  const number = String(address.number || "");
  const district = String(address.district || "");
  const city = String(address.city || "");
  const state = String(address.state || "");
  const zipCode = String(address.zipCode || "");
  return [
    [street, number].filter(Boolean).join(", "),
    district,
    [city, state].filter(Boolean).join(" - "),
    zipCode,
  ].filter(Boolean).join(" · ");
}

function SellerOrderCard({ order }: { order: CommerceOrder }) {
  const queryClient = useQueryClient();
  const { formatMoney } = useMarket();
  const { locale } = useLocale();
  const [carrier, setCarrier] = useState(order.fulfillmentMethod === "local_delivery" ? "Marketlift Rider" : "");
  const [trackingCode, setTrackingCode] = useState("");
  const title = String(order.listingSnapshot.title || (locale === "pt-BR" ? "Pedido Marketlift" : "Marketlift order"));
  const image = String((order.listingSnapshot.images as string[] | undefined)?.[0] || "/images/listing-placeholder.svg");
  const destination = addressLine(order.shippingAddress || {});

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
  const processing = useMutation({ mutationFn: () => commerceService.markOrderProcessing(order.id), onSuccess: refresh });
  const shipped = useMutation({ mutationFn: () => commerceService.markOrderShipped(order.id, carrier, trackingCode), onSuccess: refresh });

  return (
    <article className="rounded-3xl border bg-white p-5 shadow-sm">
      <div className="flex gap-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100"><Image src={image} alt="" fill className="object-cover" /></div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-xs font-black uppercase tracking-wide text-slate-400">{order.reference}</p><h2 className="mt-1 line-clamp-2 font-black">{title}</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase">{order.status.replaceAll("_", " ")}</span></div>
          <p className="mt-2 text-lg font-black text-brand-700">{locale === "pt-BR" ? "Você recebe" : "You receive"} {formatMoney(order.sellerProceedsCents / 100, order.currency)}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-3">
        <div><span className="block text-xs font-bold text-slate-400">{locale === "pt-BR" ? "Método" : "Method"}</span><strong>{order.fulfillmentMethod.replaceAll("_", " ")}</strong></div>
        <div><span className="block text-xs font-bold text-slate-400">{locale === "pt-BR" ? "Pagamento" : "Payment"}</span><strong>{order.payment?.status || "pending"}</strong></div>
        <div><span className="block text-xs font-bold text-slate-400">{locale === "pt-BR" ? "Repasse" : "Settlement"}</span><strong>{order.settlement?.status || "pending"}</strong></div>
      </div>
      {destination && order.fulfillmentMethod !== "pickup" && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50/40 p-4 text-sm">
          <MapPin className="mt-0.5 size-5 shrink-0 text-brand-700" aria-hidden="true" />
          <div><p className="text-xs font-black uppercase tracking-wide text-brand-800">{locale === "pt-BR" ? "Endereço de entrega" : "Delivery address"}</p><p className="mt-1 leading-6 text-slate-700">{destination}</p></div>
        </div>
      )}
      {order.status === "awaiting_seller" && <Button className="mt-4" onClick={() => processing.mutate()} disabled={processing.isPending}><Box className="size-4" /> {locale === "pt-BR" ? "Preparar pedido" : "Prepare order"}</Button>}
      {["awaiting_seller", "processing"].includes(order.status) && (
        <div className="mt-4 grid gap-2 rounded-2xl border p-4 sm:grid-cols-[1fr_1fr_auto]">
          <Input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder={locale === "pt-BR" ? "Transportadora / Rider" : "Carrier / Rider"} />
          <Input value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} placeholder={locale === "pt-BR" ? "Código de rastreio (se houver)" : "Tracking code (if any)"} />
          <Button onClick={() => shipped.mutate()} disabled={shipped.isPending || !carrier.trim()}><Truck className="size-4" /> {locale === "pt-BR" ? "Marcar enviado" : "Mark shipped"}</Button>
        </div>
      )}
      {(processing.isError || shipped.isError) && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{(processing.error || shipped.error) instanceof Error ? (processing.error || shipped.error)?.message : (locale === "pt-BR" ? "Não foi possível atualizar o pedido." : "The order could not be updated.")}</p>}
      {["delivered", "completed"].includes(order.status) && <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800"><CheckCircle2 className="size-5" /> {locale === "pt-BR" ? "Entrega confirmada." : "Delivery confirmed."} {order.settlement?.status === "available" ? (locale === "pt-BR" ? "Valor disponível para saque." : "Funds are available to withdraw.") : (locale === "pt-BR" ? "Valor seguindo o prazo de proteção do comprador." : "Funds remain in the buyer-protection window.")}</div>}
    </article>
  );
}

export default function SellerOrdersPage() {
  const { locale } = useLocale();
  const query = useInfiniteQuery({
    queryKey: ["seller-orders"],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => commerceService.getSellerOrders(pageParam, PAGE_SIZE),
    getNextPageParam: (lastPage, pages) => lastPage.length === PAGE_SIZE ? pages.length * PAGE_SIZE : undefined,
  });
  const orders = query.data?.pages.flat() || [];
  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
        <div className="mb-5"><p className="text-xs font-black uppercase tracking-[.14em] text-brand-700">{locale === "pt-BR" ? "Vendas online" : "Online sales"}</p><h1 className="mt-1 text-3xl font-black">{locale === "pt-BR" ? "Pedidos recebidos" : "Received orders"}</h1><p className="mt-1 text-sm text-slate-500">{locale === "pt-BR" ? "Prepare, envie e acompanhe a liberação do valor de cada venda." : "Prepare and ship orders, then track settlement release."}</p></div>
        <div className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]"><SellingSidebar /><section className="min-w-0">
          {query.isLoading && <PageLoading label={locale === "pt-BR" ? "Carregando pedidos..." : "Loading orders..."} />}
          {query.isError && <InlineError title={locale === "pt-BR" ? "Não foi possível carregar pedidos" : "Orders could not be loaded"} description={locale === "pt-BR" ? "Tente novamente." : "Please try again."} onRetry={() => query.refetch()} />}
          {!query.isLoading && !query.isError && orders.length === 0 && <EmptyState title={locale === "pt-BR" ? "Nenhum pedido online" : "No online orders"} description={locale === "pt-BR" ? "Quando um comprador pagar por um anúncio elegível, o pedido aparecerá aqui." : "Paid eligible listings will appear here as orders."} href="/selling/online-sales" action={locale === "pt-BR" ? "Configurar vendas online" : "Configure online sales"} />}
          {orders.length > 0 && <div className="space-y-4">{orders.map((order) => <SellerOrderCard key={order.id} order={order} />)}{query.hasNextPage && <Button variant="outline" className="w-full" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>{query.isFetchingNextPage ? (locale === "pt-BR" ? "Carregando..." : "Loading...") : (locale === "pt-BR" ? "Carregar mais pedidos" : "Load more orders")}</Button>}</div>}
        </section></div>
      </main>
    </MarketplaceShell>
  );
}
