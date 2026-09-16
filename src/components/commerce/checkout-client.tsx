"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Copy,
  CreditCard,
  Loader2,
  PackageCheck,
  QrCode,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InlineError, PageLoading } from "@/components/feedback/async-states";
import { listingService } from "@/services/listing.service";
import {
  commerceService,
  type CommercePaymentMethod,
  type FulfillmentMethod,
} from "@/services/commerce.service";
import { useMarket } from "@/providers/market-provider";
import { useLocale } from "@/providers/locale-provider";

export function CheckoutClient({ listingId }: { listingId: string }) {
  const { formatMoney } = useMarket();
  const { locale } = useLocale();
  const listingQuery = useQuery({
    queryKey: ["checkout-listing", listingId],
    queryFn: () => listingService.getListing(listingId),
  });
  const commerceQuery = useQuery({
    queryKey: ["listing-commerce", listingId],
    queryFn: () => commerceService.getListingCommerce(listingId),
  });
  const [fulfillment, setFulfillment] = useState<FulfillmentMethod | "">("");
  const [method, setMethod] = useState<CommercePaymentMethod>("pix");
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    crypto.randomUUID(),
  );
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
  const selectedFulfillment =
    fulfillment || commerce?.fulfillmentMethods[0] || "";
  const needsAddress = selectedFulfillment !== "pickup";
  const quoteQuery = useQuery({
    queryKey: ["commerce-checkout-quote", listingId, selectedFulfillment],
    queryFn: () =>
      commerceService.getCheckoutQuote(
        listingId,
        selectedFulfillment as FulfillmentMethod,
        1,
      ),
    enabled: Boolean(commerce?.checkoutEnabled && selectedFulfillment),
    staleTime: 15_000,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!listing || !selectedFulfillment)
        throw new Error(
          locale === "pt-BR"
            ? "Escolha uma forma de entrega."
            : "Choose a fulfillment method.",
        );
      if (!quoteQuery.data)
        throw new Error(
          locale === "pt-BR"
            ? "Aguarde o cálculo do total antes de pagar."
            : "Wait for the final total before paying.",
        );
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
      const order = await commerceService.createCheckout({
        listingId: listing.id,
        fulfillmentMethod: selectedFulfillment as FulfillmentMethod,
        paymentMethod: method,
        customerDocument: document,
        customerPhone: phone,
        idempotencyKey,
        cardId,
        shippingAddress: needsAddress
          ? {
              street,
              number,
              district,
              city,
              state,
              zipCode: zipCode.replace(/\D/g, ""),
              country: "BR",
            }
          : {},
      });

      const paymentStatus = String(order.payment?.status || "").toLowerCase();
      if (
        order.status === "cancelled" ||
        ["failed", "cancelled"].includes(paymentStatus)
      ) {
        // The backend has returned a definitive terminal result, so a corrected
        // retry must be a new checkout attempt. Network/provider ambiguity above
        // still keeps the original key, preventing duplicate charges on retry.
        setIdempotencyKey(crypto.randomUUID());
        const providerStatus = order.payment?.providerStatus?.trim();
        throw new Error(
          locale === "pt-BR"
            ? `Pagamento recusado ou cancelado${providerStatus ? ` (${providerStatus})` : ""}. Verifique os dados e tente novamente.`
            : `Payment was declined or cancelled${providerStatus ? ` (${providerStatus})` : ""}. Check the details and try again.`,
        );
      }
      return order;
    },
  });

  const qrCode = useMemo(
    () => String(mutation.data?.payment?.checkoutData?.qr_code || ""),
    [mutation.data],
  );
  const qrCodeUrl = useMemo(
    () => String(mutation.data?.payment?.checkoutData?.qr_code_url || ""),
    [mutation.data],
  );

  if (listingQuery.isLoading || commerceQuery.isLoading)
    return (
      <PageLoading
        label={
          locale === "pt-BR"
            ? "Preparando checkout..."
            : "Preparing checkout..."
        }
      />
    );
  if (listingQuery.isError || commerceQuery.isError)
    return (
      <InlineError
        title={
          locale === "pt-BR"
            ? "Não foi possível abrir o checkout"
            : "Checkout could not be opened"
        }
        description={
          locale === "pt-BR"
            ? "Atualize a página e tente novamente."
            : "Refresh the page and try again."
        }
        onRetry={() => {
          listingQuery.refetch();
          commerceQuery.refetch();
        }}
      />
    );
  if (!listing || !commerce?.checkoutEnabled) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-black">
          {locale === "pt-BR"
            ? "Compra online indisponível"
            : "Online purchase unavailable"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {locale === "pt-BR"
            ? "Este anúncio deve ser negociado diretamente com o vendedor."
            : "This listing must be negotiated directly with the seller."}
        </p>
        <Button asChild className="mt-5">
          <Link href={listing ? `/listing/${listing.slug}` : "/search"}>
            {locale === "pt-BR" ? "Voltar ao anúncio" : "Back to listing"}
          </Link>
        </Button>
      </div>
    );
  }

  if (mutation.isSuccess) {
    const order = mutation.data;
    const submittedMethod = order.payment?.method;
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="size-6" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[.14em] text-emerald-700">
                {locale === "pt-BR" ? "Pedido criado" : "Order created"}
              </p>
              <h1 className="mt-1 text-2xl font-black">{order.reference}</h1>
              <p className="mt-1 text-sm text-slate-500">
                {locale === "pt-BR"
                  ? "Acompanhe pagamento, envio, entrega e proteção do comprador pelo Marketlift."
                  : "Track payment, fulfillment, delivery and buyer protection in Marketlift."}
              </p>
            </div>
          </div>
          {submittedMethod === "pix" && qrCode && (
            <div className="mt-6 rounded-2xl border bg-slate-50 p-4">
              <div className="flex items-center gap-2 font-black">
                <QrCode className="size-5" />{" "}
                {locale === "pt-BR" ? "Pague com Pix" : "Pay with Pix"}
              </div>
              {qrCodeUrl && (
                <div className="relative mx-auto mt-4 size-52 overflow-hidden rounded-xl bg-white">
                  <Image
                    src={qrCodeUrl}
                    alt="QR Code Pix"
                    fill
                    className="object-contain p-2"
                    unoptimized
                  />
                </div>
              )}
              <p className="mt-4 break-all rounded-xl bg-white p-3 text-xs text-slate-600">
                {qrCode}
              </p>
              <Button
                variant="outline"
                className="mt-3 w-full"
                onClick={() => navigator.clipboard.writeText(qrCode)}
              >
                <Copy className="size-4" />{" "}
                {locale === "pt-BR" ? "Copiar código Pix" : "Copy Pix code"}
              </Button>
            </div>
          )}
          {submittedMethod === "card" && (
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              {locale === "pt-BR"
                ? "Pagamento do cartão enviado com segurança para o Pagar.me. Nenhum número de cartão foi enviado ao servidor do Marketlift."
                : "Card payment was securely submitted to Pagar.me. Raw card numbers were never sent to Marketlift's server."}
            </div>
          )}
          <Button asChild className="mt-6 w-full">
            <Link href="/account/orders">
              {locale === "pt-BR" ? "Ver meus pedidos" : "View my orders"}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const quote = quoteQuery.data;
  const finalTotal = quote
    ? formatMoney(quote.totalCents / 100, quote.currency)
    : "—";
  const cardIncomplete =
    method === "card" &&
    (!holderName.trim() ||
      !cardNumber.trim() ||
      !expMonth.trim() ||
      !expYear.trim() ||
      !cvv.trim());

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="space-y-5">
        <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-emerald-600" />
            <h1 className="text-2xl font-black">
              {locale === "pt-BR" ? "Checkout protegido" : "Protected checkout"}
            </h1>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {locale === "pt-BR"
              ? "O vendedor recebe o valor somente conforme o fluxo de entrega e proteção do Marketlift."
              : "Seller proceeds are released only according to Marketlift's delivery and buyer-protection flow."}
          </p>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-black">
            {locale === "pt-BR" ? "1. Entrega" : "1. Fulfillment"}
          </h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {commerce.fulfillmentMethods.map((item) => (
              <button
                key={item}
                type="button"
                disabled={mutation.isPending}
                onClick={() => setFulfillment(item)}
                className={`rounded-2xl border p-4 text-left text-sm font-bold disabled:opacity-50 ${selectedFulfillment === item ? "border-brand-500 bg-brand-50 text-brand-900" : "bg-white"}`}
              >
                <Truck className="mb-2 size-5" />
                {item === "shipping"
                  ? locale === "pt-BR"
                    ? "Envio"
                    : "Shipping"
                  : item === "local_delivery"
                    ? locale === "pt-BR"
                      ? "Entrega local"
                      : "Local delivery"
                    : locale === "pt-BR"
                      ? "Retirada"
                      : "Pickup"}
              </button>
            ))}
          </div>
          {needsAddress && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Input
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="CEP"
              />
              <Input
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder={locale === "pt-BR" ? "Rua" : "Street"}
              />
              <Input
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder={locale === "pt-BR" ? "Número" : "Number"}
              />
              <Input
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder={locale === "pt-BR" ? "Bairro" : "District"}
              />
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={locale === "pt-BR" ? "Cidade" : "City"}
              />
              <Input
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                placeholder="UF"
                maxLength={2}
              />
            </div>
          )}
          {quoteQuery.isError && (
            <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {quoteQuery.error instanceof Error
                ? quoteQuery.error.message
                : locale === "pt-BR"
                  ? "Não foi possível calcular o total."
                  : "The final total could not be calculated."}
            </p>
          )}
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-black">
            {locale === "pt-BR"
              ? "2. Identificação do pagamento"
              : "2. Payment identity"}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Input
              value={document}
              onChange={(e) => setDocument(e.target.value)}
              placeholder="CPF"
              inputMode="numeric"
            />
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={
                locale === "pt-BR"
                  ? "Celular com DDD"
                  : "Mobile number with area code"
              }
              inputMode="tel"
            />
          </div>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-black">
            {locale === "pt-BR" ? "3. Pagamento" : "3. Payment"}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={mutation.isPending}
              onClick={() => setMethod("pix")}
              className={`rounded-2xl border p-4 text-left font-bold disabled:opacity-50 ${method === "pix" ? "border-brand-500 bg-brand-50" : ""}`}
            >
              <QrCode className="mb-2 size-5" />
              Pix
            </button>
            <button
              type="button"
              disabled={mutation.isPending}
              onClick={() => setMethod("card")}
              className={`rounded-2xl border p-4 text-left font-bold disabled:opacity-50 ${method === "card" ? "border-brand-500 bg-brand-50" : ""}`}
            >
              <CreditCard className="mb-2 size-5" />
              {locale === "pt-BR" ? "Cartão" : "Card"}
            </button>
          </div>
          {method === "card" && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Input
                className="sm:col-span-2"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                placeholder={
                  locale === "pt-BR" ? "Nome no cartão" : "Name on card"
                }
                autoComplete="cc-name"
              />
              <Input
                className="sm:col-span-2"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder={
                  locale === "pt-BR" ? "Número do cartão" : "Card number"
                }
                inputMode="numeric"
                autoComplete="cc-number"
              />
              <Input
                value={expMonth}
                onChange={(e) => setExpMonth(e.target.value)}
                placeholder={locale === "pt-BR" ? "Mês (MM)" : "Month (MM)"}
                inputMode="numeric"
                autoComplete="cc-exp-month"
              />
              <Input
                value={expYear}
                onChange={(e) => setExpYear(e.target.value)}
                placeholder={locale === "pt-BR" ? "Ano (AAAA)" : "Year (YYYY)"}
                inputMode="numeric"
                autoComplete="cc-exp-year"
              />
              <Input
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="CVV"
                inputMode="numeric"
                autoComplete="cc-csc"
              />
              <p className="self-center text-xs text-slate-500">
                {locale === "pt-BR"
                  ? "Os dados são tokenizados diretamente pelo Pagar.me."
                  : "Card details are tokenized directly by Pagar.me."}
              </p>
            </div>
          )}
          {mutation.isError && (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
              {mutation.error instanceof Error
                ? mutation.error.message
                : locale === "pt-BR"
                  ? "Não foi possível concluir a compra."
                  : "The purchase could not be completed."}
            </p>
          )}
        </div>
      </section>

      <aside className="self-start rounded-3xl border bg-white p-5 shadow-sm lg:sticky lg:top-28">
        <div className="flex gap-3">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
            <Image
              src={listing.images[0]}
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="line-clamp-2 font-black">{listing.title}</p>
            <p className="mt-1 text-lg font-black text-brand-700">
              {formatMoney(listing.price)}
            </p>
          </div>
        </div>
        <div className="mt-5 space-y-2 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">
              {locale === "pt-BR" ? "Item" : "Item"}
            </span>
            <strong>
              {quote
                ? formatMoney(quote.subtotalCents / 100, quote.currency)
                : formatMoney(listing.price)}
            </strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">
              {locale === "pt-BR" ? "Entrega" : "Delivery"}
            </span>
            <strong>
              {quote
                ? formatMoney(quote.shippingAmountCents / 100, quote.currency)
                : "—"}
            </strong>
          </div>
          <div className="flex justify-between border-t pt-2 text-base">
            <span className="font-black">Total</span>
            <strong>{finalTotal}</strong>
          </div>
        </div>
        <Button
          className="mt-5 w-full"
          disabled={
            mutation.isPending ||
            quoteQuery.isLoading ||
            !quote ||
            !selectedFulfillment ||
            !document ||
            !phone ||
            cardIncomplete ||
            (needsAddress &&
              (!street || !number || !district || !city || !state || !zipCode))
          }
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <PackageCheck className="size-4" />
          )}
          {mutation.isPending
            ? locale === "pt-BR"
              ? "Processando..."
              : "Processing..."
            : `${locale === "pt-BR" ? "Pagar" : "Pay"} ${finalTotal}`}
        </Button>
        <p className="mt-3 text-center text-[11px] leading-4 text-slate-500">
          {locale === "pt-BR"
            ? "Ao continuar, o pedido fica registrado no Marketlift para entrega, suporte, disputa e reembolso."
            : "By continuing, the order is recorded in Marketlift for fulfillment, support, disputes and refunds."}
        </p>
      </aside>
    </div>
  );
}
