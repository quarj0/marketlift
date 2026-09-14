"use client";

import Image from "next/image";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, CheckCircle2, PackageCheck, Truck } from "lucide-react";

import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { SellingSidebar } from "@/components/selling/selling-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, InlineError, PageLoading } from "@/components/feedback/async-states";
import { commerceService, type CommerceOrder } from "@/services/commerce.service";
import { useMarket } from "@/providers/market-provider";

function SellerOrderCard({ order }: { order: CommerceOrder }) {
  const queryClient = useQueryClient();
  const { formatMoney } = useMarket();
  const [carrier, setCarrier] = useState(order.fulfillmentMethod === "local_delivery" ? "Marketlift Rider" : "");
  const [trackingCode, setTrackingCode] = useState("");
  const title = String(order.listingSnapshot.title || "Pedido Marketlift");
  const image = String((order.listingSnapshot.images as string[] | undefined)?.[0] || "/images/listing-placeholder.svg");

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
  const processing = useMutation({ mutationFn: () => commerceService.markOrderProcessing(order.id), onSuccess: refresh });
  const shipped = useMutation({ mutationFn: () => commerceService.markOrderShipped(order.id, carrier, trackingCode), onSuccess: refresh });

  return (
    <article className="rounded-3xl border bg-white p-5 shadow-sm">
      <div className="flex gap-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100"><Image src={image} alt="" fill className="object-cover" /></div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-xs font-black uppercase tracking-wide text-slate-400">{order.reference}</p><h2 className="mt-1 line-clamp-2 font-black">{title}</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase">{order.status.replaceAll("_", " ")}</span></div>
          <p className="mt-2 text-lg font-black text-brand-700">Você recebe {formatMoney(order.sellerProceedsCents / 100, order.currency)}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-3">
        <div><span className="block text-xs font-bold text-slate-400">Método</span><strong>{order.fulfillmentMethod.replaceAll("_", " ")}</strong></div>
        <div><span className="block text-xs font-bold text-slate-400">Pagamento</span><strong>{order.payment?.status || "pending"}</strong></div>
        <div><span className="block text-xs font-bold text-slate-400">Repasse</span><strong>{order.settlement?.status || "pending"}</strong></div>
      </div>
      {order.status === "awaiting_seller" && <Button className="mt-4" onClick={() => processing.mutate()} disabled={processing.isPending}><Box className="size-4" /> Preparar pedido</Button>}
      {["awaiting_seller", "processing"].includes(order.status) && (
        <div className="mt-4 grid gap-2 rounded-2xl border p-4 sm:grid-cols-[1fr_1fr_auto]">
          <Input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="Transportadora / Rider" />
          <Input value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} placeholder="Código de rastreio (se houver)" />
          <Button onClick={() => shipped.mutate()} disabled={shipped.isPending || !carrier.trim()}><Truck className="size-4" /> Marcar enviado</Button>
        </div>
      )}
      {["delivered", "completed"].includes(order.status) && <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800"><CheckCircle2 className="size-5" /> Entrega confirmada. {order.settlement?.status === "available" ? "Valor disponível para saque." : "Valor seguindo o prazo de proteção do comprador."}</div>}
    </article>
  );
}

export default function SellerOrdersPage() {
  const query = useQuery({ queryKey: ["seller-orders"], queryFn: commerceService.getSellerOrders });
  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
        <div className="mb-5"><p className="text-xs font-black uppercase tracking-[.14em] text-brand-700">Vendas online</p><h1 className="mt-1 text-3xl font-black">Pedidos recebidos</h1><p className="mt-1 text-sm text-slate-500">Prepare, envie e acompanhe a liberação do valor de cada venda.</p></div>
        <div className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]"><SellingSidebar /><section className="min-w-0">
          {query.isLoading && <PageLoading label="Carregando pedidos..." />}
          {query.isError && <InlineError title="Não foi possível carregar pedidos" description="Tente novamente." onRetry={() => query.refetch()} />}
          {!query.isLoading && !query.isError && query.data?.length === 0 && <EmptyState title="Nenhum pedido online" description="Quando um comprador pagar por um anúncio elegível, o pedido aparecerá aqui." href="/selling/online-sales" action="Configurar vendas online" />}
          {!!query.data?.length && <div className="space-y-4">{query.data.map((order) => <SellerOrderCard key={order.id} order={order} />)}</div>}
        </section></div>
      </main>
    </MarketplaceShell>
  );
}
