"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
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

const pendingCheckoutKey = (listingId: string) =>
  `marketlift:stripe-checkout:${listingId}`;

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
  const [resumeUrl, setResumeUrl] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");

  useEffect(() => {
    const raw = window.localStorage.getItem(pendingCheckoutKey(listingId));
    if (!raw) return;
    let savedUrl = "";
    try {
      const saved = JSON.parse(raw) as { url?: string; createdAt?: number };
      const age = Date.now() - Number(saved.createdAt || 0);
      if (saved.url && age >= 0 && age < 35 * 60 * 1000) {
        savedUrl = saved.url;
      } else {
        window.localStorage.removeItem(pendingCheckoutKey(listingId));
      }
    } catch {
      window.localStorage.removeItem(pendingCheckoutKey(listingId));
    }
    if (!savedUrl) return;
    const timer = window.setTimeout(() => setResumeUrl(savedUrl), 0);
    return () => window.clearTimeout(timer);
  }, [listingId]);

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
      if (!listing || !selectedFulfillment) {
        throw new Error(
          locale === "pt-BR"
            ? "Escolha uma forma de entrega."
            : "Choose a fulfillment method.",
        );
      }
      if (!quoteQuery.data) {
        throw new Error(
          locale === "pt-BR"
            ? "Aguarde o cálculo do total antes de pagar."
            : "Wait for the final total before paying.",
        );
      }

      const order = await commerceService.createCheckout({
        listingId: listing.id,
        fulfillmentMethod: selectedFulfillment as FulfillmentMethod,
        paymentMethod: method,
        idempotencyKey,
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
        setIdempotencyKey(crypto.randomUUID());
        const providerStatus = order.payment?.providerStatus?.trim();
        throw new Error(
          locale === "pt-BR"
            ? `Não foi possível iniciar o pagamento${providerStatus ? ` (${providerStatus})` : ""}.`
            : `Payment could not be started${providerStatus ? ` (${providerStatus})` : ""}.`,
        );
      }

      const checkoutUrl = String(
        order.payment?.checkoutData?.checkout_url || "",
      ).trim();
      if (!checkoutUrl) {
        throw new Error(
          locale === "pt-BR"
            ? "O Stripe não retornou uma página de pagamento."
            : "Stripe did not return a payment page.",
        );
      }

      window.localStorage.setItem(
        pendingCheckoutKey(listingId),
        JSON.stringify({
          url: checkoutUrl,
          idempotencyKey,
          method,
          createdAt: Date.now(),
        }),
      );
      setResumeUrl(checkoutUrl);
      window.location.assign(checkoutUrl);
      return order;
    },
  });

  if (listingQuery.isLoading || commerceQuery.isLoading) {
    return (
      <PageLoading
        label={
          locale === "pt-BR"
            ? "Preparando checkout..."
            : "Preparing checkout..."
        }
      />
    );
  }

  if (listingQuery.isError || commerceQuery.isError) {
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
  }

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
          <Link href={`/listing/${listing.slug}`}>
            {locale === "pt-BR" ? "Voltar ao anúncio" : "Back to listing"}
          </Link>
        </Button>
      </div>
    );
  }

  const quote = quoteQuery.data;
  const finalTotal = quote
    ? formatMoney(quote.totalCents / 100, quote.currency)
    : "—";

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
              ? "O pagamento é concluído no Stripe. O Marketlift libera o valor do vendedor somente conforme o fluxo de entrega e proteção do comprador."
              : "Payment is completed securely on Stripe. Marketlift releases seller proceeds only through the delivery and buyer-protection flow."}
          </p>
          {resumeUrl && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-bold text-amber-900">
                {locale === "pt-BR"
                  ? "Você tem um checkout Stripe recente para este anúncio."
                  : "You have a recent Stripe checkout for this listing."}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-3"
                onClick={() => window.location.assign(resumeUrl)}
              >
                {locale === "pt-BR" ? "Continuar pagamento" : "Continue payment"}
              </Button>
            </div>
          )}
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
                className={`rounded-2xl border p-4 text-left text-sm font-bold disabled:opacity-50 ${
                  selectedFulfillment === item
                    ? "border-brand-500 bg-brand-50 text-brand-900"
                    : "bg-white"
                }`}
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
                onChange={(event) => setZipCode(event.target.value)}
                placeholder="CEP"
              />
              <Input
                value={street}
                onChange={(event) => setStreet(event.target.value)}
                placeholder={locale === "pt-BR" ? "Rua" : "Street"}
              />
              <Input
                value={number}
                onChange={(event) => setNumber(event.target.value)}
                placeholder={locale === "pt-BR" ? "Número" : "Number"}
              />
              <Input
                value={district}
                onChange={(event) => setDistrict(event.target.value)}
                placeholder={locale === "pt-BR" ? "Bairro" : "District"}
              />
              <Input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder={locale === "pt-BR" ? "Cidade" : "City"}
              />
              <Input
                value={state}
                onChange={(event) => setState(event.target.value.toUpperCase())}
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
            {locale === "pt-BR" ? "2. Pagamento" : "2. Payment"}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={mutation.isPending}
              onClick={() => setMethod("pix")}
              className={`rounded-2xl border p-4 text-left font-bold disabled:opacity-50 ${
                method === "pix" ? "border-brand-500 bg-brand-50" : ""
              }`}
            >
              <QrCode className="mb-2 size-5" />
              Pix
            </button>
            <button
              type="button"
              disabled={mutation.isPending}
              onClick={() => setMethod("card")}
              className={`rounded-2xl border p-4 text-left font-bold disabled:opacity-50 ${
                method === "card" ? "border-brand-500 bg-brand-50" : ""
              }`}
            >
              <CreditCard className="mb-2 size-5" />
              {locale === "pt-BR" ? "Cartão" : "Card"}
            </button>
          </div>
          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            {locale === "pt-BR"
              ? method === "pix"
                ? "Você será direcionado ao Stripe para gerar e pagar o Pix com segurança."
                : "Você será direcionado ao Stripe para inserir os dados do cartão. O Marketlift nunca recebe o número do seu cartão."
              : method === "pix"
                ? "You will continue to Stripe to generate and pay the Pix securely."
                : "You will continue to Stripe to enter card details. Marketlift never receives your card number."}
          </p>

          {mutation.isError && (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
              {mutation.error instanceof Error
                ? mutation.error.message
                : locale === "pt-BR"
                  ? "Não foi possível iniciar o pagamento."
                  : "Payment could not be started."}
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
              ? "Abrindo Stripe..."
              : "Opening Stripe..."
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
