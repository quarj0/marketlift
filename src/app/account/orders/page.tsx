"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Copy, QrCode, Truck } from "lucide-react";

import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, InlineError, PageLoading } from "@/components/feedback/async-states";
import { commerceService, type CommerceOrder } from "@/services/commerce.service";
import { useMarket } from "@/providers/market-provider";
import { useLocale } from "@/providers/locale-provider";

const PAGE_SIZE = 50;

function OrderCard({ order }: { order: CommerceOrder }) {
  const queryClient = useQueryClient();
  const { formatMoney } = useMarket();
  const { locale } = useLocale();
  const [problemOpen, setProblemOpen] = useState(false);
  const [reason, setReason] = useState("item_not_as_described");
  const [description, setDescription] = useState("");
  const title = String(order.listingSnapshot.title || (locale === "pt-BR" ? "Pedido Marketlift" : "Marketlift order"));
  const image = String((order.listingSnapshot.images as string[] | undefined)?.[0] || "/images/listing-placeholder.svg");
  const deliveryPin = String(order.listingSnapshot.delivery_pin || "");
  const pixCode = useMemo(() => String(order.payment?.checkoutData?.qr_code || ""), [order.payment?.checkoutData]);
  const pixQrUrl = useMemo(() => String(order.payment?.checkoutData?.qr_code_url || ""), [order.payment?.checkoutData]);

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

  const canConfirm = ["shipped", "out_for_delivery"].includes(order.status);
  const canDispute = ["awaiting_seller", "processing", "shipped", "out_for_delivery", "delivered"].includes(order.status);

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
        <div><span className="block text-xs font-bold text-slate-400">{locale === "pt-BR" ? "Pagamento" : "Payment"}</span><strong>{order.payment?.status || "pending"}</strong></div>
        <div><span className="block text-xs font-bold text-slate-400">{locale === "pt-BR" ? "Entrega" : "Delivery"}</span><strong>{order.shipment?.status || order.fulfillmentMethod}</strong></div>
        <div><span className="block text-xs font-bold text-slate-400">{locale === "pt-BR" ? "Proteção" : "Protection"}</span><strong>{order.settlement?.status || "pending"}</strong></div>
      </div>

      {order.payment?.method === "pix" && order.payment.status === "pending" && pixCode && (
        <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50/40 p-4">
          <div className="flex items-center gap-2 font-black"><QrCode className="size-5" /> {locale === "pt-BR" ? "Pix pendente" : "Pending Pix payment"}</div>
          {pixQrUrl && <div className="relative mx-auto mt-4 size-44 overflow-hidden rounded-xl bg-white"><Image src={pixQrUrl} alt="Pix QR code" fill className="object-contain p-2" unoptimized /></div>}
          <p className="mt-3 break-all rounded-xl bg-white p-3 text-xs text-slate-600">{pixCode}</p>
          <Button type="button" variant="outline" className="mt-3 w-full" onClick={() => navigator.clipboard.writeText(pixCode)}><Copy className="size-4" /> {locale === "pt-BR" ? "Copiar código Pix" : "Copy Pix code"}</Button>
        </div>
      )}

      {deliveryPin && order.fulfillmentMethod === "local_delivery" && !["delivered", "completed"].includes(order.status) && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-amber-800">{locale === "pt-BR" ? "Código de entrega" : "Delivery code"}</p>
          <p className="mt-1 text-2xl font-black tracking-[.22em] text-amber-950">{deliveryPin}</p>
          <p className="mt-1 text-xs text-amber-800">{locale === "pt-BR" ? "Só entregue este código ao entregador depois de receber o pacote." : "Only give this code to the courier after receiving the package."}</p>
        </div>
      )}

      {(order.shipment?.trackingCode || order.shipment?.carrier) && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border p-4 text-sm">
          <Truck className="size-5 text-brand-700" />
          <div><strong>{order.shipment?.carrier || (locale === "pt-BR" ? "Transportadora" : "Carrier")}</strong><p className="text-slate-500">{order.shipment?.trackingCode || (locale === "pt-BR" ? "Rastreamento pendente" : "Tracking pending")}</p></div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {canConfirm && (
          <Button onClick={() => confirm.mutate()} disabled={confirm.isPending}>
            <CheckCircle2 className="size-4" /> {locale === "pt-BR" ? "Recebi meu pedido" : "I received my order"}
          </Button>
        )}
        {canDispute && (
          <Button variant="outline" onClick={() => setProblemOpen((value) => !value)}>
            <AlertTriangle className="size-4" /> {locale === "pt-BR" ? "Tenho um problema" : "I have a problem"}
          </Button>
        )}
      </div>

      {confirm.isError && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{confirm.error instanceof Error ? confirm.error.message : (locale === "pt-BR" ? "Não foi possível confirmar o recebimento." : "Receipt confirmation failed.")}</p>}

      {problemOpen && (
        <div className="mt-4 space-y-3 rounded-2xl border border-red-100 bg-red-50/50 p-4">
          <label className="block text-sm font-bold">{locale === "pt-BR" ? "Motivo" : "Reason"}
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 block min-h-11 w-full rounded-xl border bg-white px-3">
              <option value="item_not_as_described">{locale === "pt-BR" ? "Item diferente do anúncio" : "Item not as described"}</option>
              <option value="damaged">{locale === "pt-BR" ? "Item danificado" : "Damaged item"}</option>
              <option value="counterfeit">{locale === "pt-BR" ? "Suspeita de produto falso" : "Suspected counterfeit"}</option>
              <option value="not_received">{locale === "pt-BR" ? "Não recebi o pedido" : "Order not received"}</option>
              <option value="other">{locale === "pt-BR" ? "Outro" : "Other"}</option>
            </select>
          </label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={locale === "pt-BR" ? "Descreva o problema" : "Describe the problem"} />
          {dispute.isError && <p className="rounded-xl bg-red-100 p-3 text-sm text-red-800">{dispute.error instanceof Error ? dispute.error.message : (locale === "pt-BR" ? "Não foi possível abrir a disputa." : "The dispute could not be opened.")}</p>}
          <Button variant="destructive" onClick={() => dispute.mutate()} disabled={dispute.isPending || !description.trim()}>{locale === "pt-BR" ? "Abrir disputa" : "Open dispute"}</Button>
        </div>
      )}
    </article>
  );
}

export default function OrdersPage() {
  const { locale } = useLocale();
  const query = useInfiniteQuery({
    queryKey: ["my-commerce-orders"],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => commerceService.getMyOrders(pageParam, PAGE_SIZE),
    getNextPageParam: (lastPage, pages) => lastPage.length === PAGE_SIZE ? pages.length * PAGE_SIZE : undefined,
  });
  const orders = query.data?.pages.flat() || [];

  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-5xl px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-12">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[.14em] text-brand-700">{locale === "pt-BR" ? "Compras" : "Purchases"}</p>
          <h1 className="mt-1 text-3xl font-black">{locale === "pt-BR" ? "Meus pedidos" : "My orders"}</h1>
          <p className="mt-1 text-sm text-slate-500">{locale === "pt-BR" ? "Acompanhe pagamento, envio, entrega, proteção e disputas." : "Track payment, fulfillment, delivery, protection and disputes."}</p>
        </div>
        {query.isLoading && <PageLoading label={locale === "pt-BR" ? "Carregando pedidos..." : "Loading orders..."} />}
        {query.isError && <InlineError title={locale === "pt-BR" ? "Não foi possível carregar seus pedidos" : "Your orders could not be loaded"} description={locale === "pt-BR" ? "Tente novamente." : "Please try again."} onRetry={() => query.refetch()} />}
        {!query.isLoading && !query.isError && orders.length === 0 && <EmptyState title={locale === "pt-BR" ? "Nenhum pedido ainda" : "No orders yet"} description={locale === "pt-BR" ? "Quando você comprar um item pelo checkout do Marketlift, ele aparecerá aqui." : "Items purchased through Marketlift checkout will appear here."} href="/search" action={locale === "pt-BR" ? "Ver anúncios" : "Browse listings"} />}
        {orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => <OrderCard key={order.id} order={order} />)}
            {query.hasNextPage && <Button variant="outline" className="w-full" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>{query.isFetchingNextPage ? (locale === "pt-BR" ? "Carregando..." : "Loading...") : (locale === "pt-BR" ? "Carregar mais pedidos" : "Load more orders")}</Button>}
          </div>
        )}
      </main>
    </MarketplaceShell>
  );
}