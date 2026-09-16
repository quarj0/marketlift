"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, MapPin, PackageCheck, Truck } from "lucide-react";

import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";
import { useLocale } from "@/providers/locale-provider";
import { commerceService, type CommerceOrder } from "@/services/commerce.service";

function addressLabel(address: Record<string, unknown>) {
  return [
    address.street,
    address.number,
    address.district,
    address.city,
    address.state,
    address.postalCode || address.cep,
  ]
    .filter((value) => typeof value === "string" && value.trim())
    .join(", ");
}

function DeliveryCard({ order }: { order: CommerceOrder }) {
  const { locale } = useLocale();
  const queryClient = useQueryClient();
  const [pin, setPin] = useState("");
  const title = String(order.listingSnapshot.title || order.reference);
  const address = addressLabel(order.shippingAddress);

  const start = useMutation({
    mutationFn: () => commerceService.startDelivery(order.id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["my-delivery-orders"] }),
  });
  const confirm = useMutation({
    mutationFn: () => commerceService.confirmRiderDeliveryPin(order.id, pin),
    onSuccess: () => {
      setPin("");
      queryClient.invalidateQueries({ queryKey: ["my-delivery-orders"] });
    },
  });

  const canStart = ["processing", "shipped"].includes(order.status);
  const canConfirm = order.status === "out_for_delivery";

  return (
    <article className="rounded-3xl border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-brand-700">
            {order.reference}
          </p>
          <h2 className="mt-1 text-lg font-black text-slate-950">{title}</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-700">
          {order.status.replaceAll("_", " ")}
        </span>
      </div>

      {address && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          <MapPin className="mt-0.5 size-5 shrink-0 text-brand-700" />
          <div>
            <strong>{locale === "pt-BR" ? "Destino" : "Destination"}</strong>
            <p className="mt-1 leading-5">{address}</p>
          </div>
        </div>
      )}

      {canStart && (
        <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 p-4">
          <p className="text-sm font-bold text-sky-950">
            {locale === "pt-BR"
              ? "Inicie a entrega apenas quando estiver com o pacote."
              : "Start delivery only when you have the package."}
          </p>
          <Button
            className="mt-3 w-full"
            disabled={start.isPending}
            onClick={() => start.mutate()}
          >
            {start.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Truck className="size-4" />
            )}
            {locale === "pt-BR" ? "Iniciar entrega" : "Start delivery"}
          </Button>
          {start.isError && (
            <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">
              {start.error instanceof Error
                ? start.error.message
                : locale === "pt-BR"
                  ? "Não foi possível iniciar a entrega."
                  : "Delivery could not be started."}
            </p>
          )}
        </div>
      )}

      {canConfirm && (
        <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
          <div className="flex items-center gap-2 font-black text-emerald-950">
            <PackageCheck className="size-5" />
            {locale === "pt-BR" ? "Confirmar entrega" : "Confirm handoff"}
          </div>
          <p className="mt-2 text-xs leading-5 text-emerald-900">
            {locale === "pt-BR"
              ? "Depois de entregar o produto, peça ao comprador o PIN de seis dígitos exibido no pedido. Você nunca deve receber o PIN antes da entrega."
              : "After handing over the item, ask the buyer for the six-digit PIN shown in their order. Never ask for the PIN before delivery."}
          </p>
          <Input
            className="mt-3 h-12 text-center text-xl font-black tracking-[.35em]"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={pin}
            disabled={confirm.isPending}
            onChange={(event) =>
              setPin(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            aria-label={locale === "pt-BR" ? "PIN do comprador" : "Buyer PIN"}
            placeholder="000000"
          />
          <Button
            className="mt-3 w-full"
            disabled={confirm.isPending || pin.length !== 6}
            onClick={() => confirm.mutate()}
          >
            {confirm.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            {locale === "pt-BR" ? "Confirmar entrega concluída" : "Confirm successful handoff"}
          </Button>
          {confirm.isError && (
            <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">
              {confirm.error instanceof Error
                ? confirm.error.message
                : locale === "pt-BR"
                  ? "Não foi possível confirmar a entrega."
                  : "Delivery confirmation failed."}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

export default function DeliveryPage() {
  const { user, hydrated } = useAuth();
  const { locale } = useLocale();
  const riderQuery = useQuery({
    queryKey: ["my-delivery-rider"],
    queryFn: commerceService.getMyDeliveryRider,
    enabled: hydrated && Boolean(user),
  });
  const ordersQuery = useQuery({
    queryKey: ["my-delivery-orders"],
    queryFn: () => commerceService.getMyDeliveryOrders(0, 50),
    enabled: Boolean(riderQuery.data?.active),
    refetchInterval: 30_000,
  });

  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-4xl px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-12">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[.14em] text-brand-700">
            {locale === "pt-BR" ? "Entregas" : "Delivery"}
          </p>
          <h1 className="mt-1 text-3xl font-black">
            {locale === "pt-BR" ? "Minhas entregas" : "My deliveries"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {locale === "pt-BR"
              ? "Somente entregas atribuídas à sua conta aparecem aqui."
              : "Only deliveries assigned to your rider account appear here."}
          </p>
        </div>

        {!hydrated || riderQuery.isLoading ? (
          <div className="grid min-h-52 place-items-center rounded-3xl border bg-white">
            <Loader2 className="size-6 animate-spin text-brand-600" />
          </div>
        ) : !user ? (
          <div className="rounded-3xl border bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-black">
              {locale === "pt-BR" ? "Entre para continuar" : "Sign in to continue"}
            </h2>
            <Button className="mt-4" asChild>
              <Link href="/login">{locale === "pt-BR" ? "Entrar" : "Sign in"}</Link>
            </Button>
          </div>
        ) : riderQuery.isError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800" role="alert">
            {riderQuery.error instanceof Error
              ? riderQuery.error.message
              : locale === "pt-BR"
                ? "Não foi possível verificar o acesso de entregador."
                : "Rider access could not be checked."}
          </div>
        ) : !riderQuery.data?.active ? (
          <div className="rounded-3xl border bg-white p-8 text-center shadow-sm">
            <Truck className="mx-auto size-9 text-slate-400" />
            <h2 className="mt-3 text-xl font-black">
              {locale === "pt-BR" ? "Acesso de entregador indisponível" : "Rider access unavailable"}
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              {locale === "pt-BR"
                ? "Esta conta não está habilitada como entregador Marketlift. O acesso é concedido e revogado pelo administrador."
                : "This account is not enabled as a Marketlift rider. Rider access is granted and revoked by an administrator."}
            </p>
          </div>
        ) : ordersQuery.isLoading ? (
          <div className="grid min-h-52 place-items-center rounded-3xl border bg-white">
            <Loader2 className="size-6 animate-spin text-brand-600" />
          </div>
        ) : ordersQuery.isError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800" role="alert">
            <p className="font-bold">
              {locale === "pt-BR" ? "Não foi possível carregar as entregas." : "Deliveries could not be loaded."}
            </p>
            <Button variant="outline" className="mt-4" onClick={() => ordersQuery.refetch()}>
              {locale === "pt-BR" ? "Tentar novamente" : "Try again"}
            </Button>
          </div>
        ) : (ordersQuery.data || []).length === 0 ? (
          <div className="rounded-3xl border bg-white p-8 text-center shadow-sm">
            <PackageCheck className="mx-auto size-9 text-emerald-500" />
            <h2 className="mt-3 text-xl font-black">
              {locale === "pt-BR" ? "Nenhuma entrega pendente" : "No pending deliveries"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {locale === "pt-BR" ? "Novas entregas atribuídas aparecerão aqui." : "New assigned deliveries will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {(ordersQuery.data || []).map((order) => (
              <DeliveryCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>
    </MarketplaceShell>
  );
}
