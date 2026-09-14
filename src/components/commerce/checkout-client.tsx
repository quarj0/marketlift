"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Copy, CreditCard, Loader2, PackageCheck, QrCode, ShieldCheck, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InlineError, PageLoading } from "@/components/feedback/async-states";
import { listingService } from "@/services/listing.service";
import { commerceService, type CommercePaymentMethod, type FulfillmentMethod } from "@/services/commerce.service";
import { useMarket } from "@/providers/market-provider";

export function CheckoutClient({ listingId }: { listingId: string }) {
  const { formatMoney } = useMarket();
  const listingQuery = useQuery({ queryKey: ["checkout-listing", listingId], queryFn: () => listingService.getListing(listingId) });
  const commerceQuery = useQuery({ queryKey: ["listing-commerce", listingId], queryFn: () => commerceService.getListingCommerce(listingId) });
  const [fulfillment, setFulfillment] = useState<FulfillmentMethod | "">("");
  const [method, setMethod] = useState<CommercePaymentMethod>("pix");
  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [holderName, setHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState("");

  const commerce = commerceQuery.data;
  const listing = listingQuery.data;
  const selectedFulfillment = fulfillment || commerce?.fulfillmentMethods[0] || "";
  const needsAddress = selectedFulfillment !== "pickup";

  const mutation = useMutation({
    mutationFn: async () => {
      if (!listing || !selectedFulfillment) throw new Error("Escolha uma forma de entrega.");
      let cardId: string | undefined;
      if (method === "card") {
        const cardToken = await commerceService.tokenizeCard({
          number: cardNumber,
          holderName,
          expMonth: Number(expMonth),
          expYear: Number(expYear),
          cvv,
        });
        cardId = await commerceService.vaultCard(cardToken, document, phone);
      }
      return commerceService.createCheckout({
        listingId: listing.id,
        fulfillmentMethod: selectedFulfillment as FulfillmentMethod,
        paymentMethod: method,
        customerDocument: document,
        customerPhone: phone,
        cardId,
        shippingAddress: needsAddress
          ? { street, number, district, city, state, zipCode: zipCode.replace(/\D/g, ""), country: "BR" }
          : {},
      });
    },
  });

  const qrCode = useMemo(() => String(mutation.data?.payment?.checkoutData?.qr_code || ""), [mutation.data]);
  const qrCodeUrl = useMemo(() => String(mutation.data?.payment?.checkoutData?.qr_code_url || ""), [mutation.data]);

  if (listingQuery.isLoading || commerceQuery.isLoading) return <PageLoading label="Preparando checkout..." />;
  if (listingQuery.isError || commerceQuery.isError) return <InlineError title="Não foi possível abrir o checkout" description="Atualize a página e tente novamente." onRetry={() => { listingQuery.refetch(); commerceQuery.refetch(); }} />;
  if (!listing || !commerce?.checkoutEnabled) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-black">Compra online indisponível</h1>
        <p className="mt-2 text-sm text-slate-500">Este anúncio deve ser negociado diretamente com o vendedor.</p>
        <Button asChild className="mt-5"><Link href={listing ? `/listing/${listing.slug}` : "/search"}>Voltar ao anúncio</Link></Button>
      </div>
    );
  }

  if (mutation.isSuccess) {
    const order = mutation.data;
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><CheckCircle2 className="size-6" /></span>
            <div>
              <p className="text-xs font-black uppercase tracking-[.14em] text-emerald-700">Pedido criado</p>
              <h1 className="mt-1 text-2xl font-black">{order.reference}</h1>
              <p className="mt-1 text-sm text-slate-500">Acompanhe pagamento, envio, entrega e proteção do comprador pelo Marketlift.</p>
            </div>
          </div>
          {method === "pix" && qrCode && (
            <div className="mt-6 rounded-2xl border bg-slate-50 p-4">
              <div className="flex items-center gap-2 font-black"><QrCode className="size-5" /> Pague com Pix</div>
              {qrCodeUrl && <div className="relative mx-auto mt-4 size-52 overflow-hidden rounded-xl bg-white"><Image src={qrCodeUrl} alt="QR Code Pix" fill className="object-contain p-2" unoptimized /></div>}
              <p className="mt-4 break-all rounded-xl bg-white p-3 text-xs text-slate-600">{qrCode}</p>
              <Button variant="outline" className="mt-3 w-full" onClick={() => navigator.clipboard.writeText(qrCode)}><Copy className="size-4" /> Copiar código Pix</Button>
            </div>
          )}
          {method === "card" && (
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              Pagamento do cartão enviado com segurança para o Pagar.me. Nenhum número de cartão foi enviado ao servidor do Marketlift.
            </div>
          )}
          <Button asChild className="mt-6 w-full"><Link href="/account/orders">Ver meus pedidos</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="space-y-5">
        <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-2"><ShieldCheck className="size-5 text-emerald-600" /><h1 className="text-2xl font-black">Checkout protegido</h1></div>
          <p className="mt-2 text-sm text-slate-500">O vendedor recebe o valor somente conforme o fluxo de entrega e proteção do Marketlift.</p>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-black">1. Entrega</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {commerce.fulfillmentMethods.map((item) => (
              <button key={item} type="button" onClick={() => setFulfillment(item)} className={`rounded-2xl border p-4 text-left text-sm font-bold ${selectedFulfillment === item ? "border-brand-500 bg-brand-50 text-brand-900" : "bg-white"}`}>
                <Truck className="mb-2 size-5" />
                {item === "shipping" ? "Envio" : item === "local_delivery" ? "Entrega local" : "Retirada"}
              </button>
            ))}
          </div>
          {needsAddress && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Input value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="CEP" />
              <Input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Rua" />
              <Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Número" />
              <Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Bairro" />
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade" />
              <Input value={state} onChange={(e) => setState(e.target.value.toUpperCase())} placeholder="UF" maxLength={2} />
            </div>
          )}
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-black">2. Identificação do pagamento</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Input value={document} onChange={(e) => setDocument(e.target.value)} placeholder="CPF" inputMode="numeric" />
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Celular com DDD" inputMode="tel" />
          </div>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-black">3. Pagamento</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setMethod("pix")} className={`rounded-2xl border p-4 text-left font-bold ${method === "pix" ? "border-brand-500 bg-brand-50" : ""}`}><QrCode className="mb-2 size-5" />Pix</button>
            <button type="button" onClick={() => setMethod("card")} className={`rounded-2xl border p-4 text-left font-bold ${method === "card" ? "border-brand-500 bg-brand-50" : ""}`}><CreditCard className="mb-2 size-5" />Cartão</button>
          </div>
          {method === "card" && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Input className="sm:col-span-2" value={holderName} onChange={(e) => setHolderName(e.target.value)} placeholder="Nome no cartão" autoComplete="cc-name" />
              <Input className="sm:col-span-2" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="Número do cartão" inputMode="numeric" autoComplete="cc-number" />
              <Input value={expMonth} onChange={(e) => setExpMonth(e.target.value)} placeholder="Mês (MM)" inputMode="numeric" autoComplete="cc-exp-month" />
              <Input value={expYear} onChange={(e) => setExpYear(e.target.value)} placeholder="Ano (AAAA)" inputMode="numeric" autoComplete="cc-exp-year" />
              <Input value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="CVV" inputMode="numeric" autoComplete="cc-csc" />
              <p className="self-center text-xs text-slate-500">Os dados são tokenizados diretamente pelo Pagar.me.</p>
            </div>
          )}
          {mutation.isError && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{mutation.error instanceof Error ? mutation.error.message : "Não foi possível concluir a compra."}</p>}
        </div>
      </section>

      <aside className="self-start rounded-3xl border bg-white p-5 shadow-sm lg:sticky lg:top-28">
        <div className="flex gap-3">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-slate-100"><Image src={listing.images[0]} alt="" fill className="object-cover" /></div>
          <div className="min-w-0"><p className="line-clamp-2 font-black">{listing.title}</p><p className="mt-1 text-lg font-black text-brand-700">{formatMoney(listing.price)}</p></div>
        </div>
        <div className="mt-5 space-y-2 border-t pt-4 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Item</span><strong>{formatMoney(listing.price)}</strong></div>
          <div className="flex justify-between"><span className="text-slate-500">Entrega</span><span>Calculada pelo fluxo</span></div>
        </div>
        <Button className="mt-5 w-full" disabled={mutation.isPending || !selectedFulfillment || !document || !phone || (needsAddress && (!street || !city || !state || !zipCode))} onClick={() => mutation.mutate()}>
          {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <PackageCheck className="size-4" />}
          {mutation.isPending ? "Processando..." : `Pagar ${formatMoney(listing.price)}`}
        </Button>
        <p className="mt-3 text-center text-[11px] leading-4 text-slate-500">Ao continuar, o pedido fica registrado no Marketlift para entrega, suporte, disputa e reembolso.</p>
      </aside>
    </div>
  );
}
