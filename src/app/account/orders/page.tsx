"use client";

import Image from "next/image";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Package, Truck } from "lucide-react";

import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, InlineError, PageLoading } from "@/components/feedback/async-states";
import { commerceService, type CommerceOrder } from "@/services/commerce.service";
import { useMarket } from "@/providers/market-provider";

function OrderCard({ order }: { order: CommerceOrder }) {
  const queryClient = useQueryClient();
  const { formatMoney } = useMarket();
  const [problemOpen, setProblemOpen] = useState(false);
  const [reason, setReason] = useState("item_not_as_described");
  const [description, setDescription] = useState("");
  const title = String(order.listingSnapshot.title || "Pedido Marketlift");
  const image = String((order.listingSnapshot.images as string[] | undefined)?.[0] || "/images/listing-placeholder.svg");
  const deliveryPin = String(order.listingSnapshot.delivery_pin || "");

  const confirm = useMutation({
    mutationFn: () => commerceService.confirmReceived(order.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-commerce-orders"] }),
  });
  const dispute = useMutation({
    mutationFn: () => commerceService.openDispute(order.id, reason, description),
    onSuccess: () => {
      setProblemOpen(false);
      queryClient.invalidateQueries({ queryKey: ["my-commerce-orders"] });
    },
  });

  const canConfirm = ["shipped", "out_for_delivery", "delivered"].includes(order.status);
  const canDispute = !["completed", "cancelled", "refunded"].includes(order.status);

  return (
    <article className="rounded-3xl border bg-white p-5 shadow-sm">
      <div className="flex gap-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
          <Image src={image} alt="" fill className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">{order.reference}</p>
              <h2 className="mt-1 line-clamp-2 font-black text-slate-950">{title}</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-700">{order.status.replaceAll("_", " ")}</span>
          </div>
          <p className="mt-2 text-lg font-black text-brand-700">{formatMoney(order.totalCents / 100, order.currency)}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-3">
        <div><span className="block text-xs font-bold text-slate-400">Pagamento</span><strong>{order.payment?.status || "pending"}</strong></div>
        <div><span className="block text-xs font-bold text-slate-400">Entrega</span><strong>{order.shipment?.status || order.fulfillmentMethod}</strong></div>
        <div><span className="block text-xs font-bold text-slate-400">Proteção</span><strong>{order.settlement?.status || "pending"}</strong></div>
      </div>

      {deliveryPin && order.fulfillmentMethod === "local_delivery" && !["delivered", "completed"].includes(order.status) && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-amber-800">Código de entrega</p>
          <p className="mt-1 text-2xl font-black tracking-[.22em] text-amber-950">{deliveryPin}</p>
          <p className="mt-1 text-xs text-amber-800">Só entregue este código ao entregador depois de receber o pacote.</p>
        </div>
      )}

      {(order.shipment?.trackingCode || order.shipment?.carrier) && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border p-4 text-sm">
          <Truck className="size-5 text-brand-700" />
          <div><strong>{order.shipment?.carrier || "Transportadora"}</strong><p className="text-slate-500">{order.shipment?.trackingCode || "Rastreamento pendente"}</p></div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {canConfirm && (
          <Button onClick={() => confirm.mutate()} disabled={confirm.isPending}>
            <CheckCircle2 className="size-4" /> Recebi meu pedido
          </Button>
        )}
        {canDispute && (
          <Button variant="outline" onClick={() => setProblemOpen((value) => !value)}>
            <AlertTriangle className="size-4" /> Tenho um problema
          </Button>
        )}
      </div>

      {problemOpen && (
        <div className="mt-4 space-y-3 rounded-2xl border border-red-100 bg-red-50/50 p-4">
          <label className="block text-sm font-bold">Motivo
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 block min-h-11 w-full rounded-xl border bg-white px-3">
              <option value="item_not_as_described">Item diferente do anúncio</option>
              <option value="damaged">Item danificado</option>
              <option value="counterfeit">Suspeita de produto falso</option>
              <option value="not_received">Não recebi o pedido</option>
              <option value="other">Outro</option>
            </select>
          </label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva o problema" />
          <Button variant="destructive" onClick={() => dispute.mutate()} disabled={dispute.isPending || !description.trim()}>Abrir disputa</Button>
        </div>
      )}
    </article>
  );
}

export default function OrdersPage() {
  const query = useQuery({ queryKey: ["my-commerce-orders"], queryFn: commerceService.getMyOrders });
  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-5xl px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-12">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[.14em] text-brand-700">Compras</p>
          <h1 className="mt-1 text-3xl font-black">Meus pedidos</h1>
          <p className="mt-1 text-sm text-slate-500">Acompanhe pagamento, envio, entrega, proteção e disputas.</p>
        </div>
        {query.isLoading && <PageLoading label="Carregando pedidos..." />}
        {query.isError && <InlineError title="Não foi possível carregar seus pedidos" description="Tente novamente." onRetry={() => query.refetch()} />}
        {!query.isLoading && !query.isError && query.data?.length === 0 && <EmptyState title="Nenhum pedido ainda" description="Quando você comprar um item pelo checkout do Marketlift, ele aparecerá aqui." href="/search" action="Ver anúncios" />}
        {!!query.data?.length && <div className="space-y-4">{query.data.map((order) => <OrderCard key={order.id} order={order} />)}</div>}
      </main>
    </MarketplaceShell>
  );
}
