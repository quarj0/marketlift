"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  Banknote,
  Landmark,
  Loader2,
  PackageCheck,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { InlineError, PageLoading } from "@/components/feedback/async-states";
import { UpcomingFeature } from "@/components/feedback/upcoming-feature";
import { commerceService } from "@/services/commerce.service";
import { useAuth } from "@/providers/auth-provider";
import { useMarket } from "@/providers/market-provider";
import { useLocale } from "@/providers/locale-provider";

export function SellerPaymentsClient() {
  const { user } = useAuth();
  const { formatMoney, paymentsEnabledForMarket } = useMarket();
  const { locale } = useLocale();
  const queryClient = useQueryClient();
  const paymentsEnabled =
    user?.countryCode === "BR" &&
    paymentsEnabledForMarket(user?.countryCode);

  const accountQuery = useQuery({
    queryKey: ["seller-payment-account"],
    queryFn: commerceService.getSellerPaymentAccount,
    enabled: paymentsEnabled,
  });
  const walletQuery = useQuery({
    queryKey: ["seller-wallet"],
    queryFn: commerceService.getSellerWallet,
    enabled: paymentsEnabled,
  });

  const activate = useMutation({
    mutationFn: () => commerceService.activateSellerPayments({}),
    onSuccess: (account) => {
      queryClient.invalidateQueries({ queryKey: ["seller-payment-account"] });
      if (account.kycUrl) {
        window.location.assign(account.kycUrl);
      }
    },
  });

  const withdraw = useMutation({
    mutationFn: commerceService.withdrawSellerBalance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-wallet"] });
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
    },
  });

  if (!paymentsEnabled) return <UpcomingFeature feature="payments" />;

  if (accountQuery.isLoading || walletQuery.isLoading) {
    return (
      <PageLoading
        label={
          locale === "pt-BR"
            ? "Carregando Marketlift Payments..."
            : "Loading Marketlift Payments..."
        }
      />
    );
  }

  if (accountQuery.isError || walletQuery.isError) {
    return (
      <InlineError
        title={
          locale === "pt-BR"
            ? "Não foi possível carregar pagamentos"
            : "Payments could not be loaded"
        }
        description={locale === "pt-BR" ? "Tente novamente." : "Please try again."}
        onRetry={() => {
          accountQuery.refetch();
          walletQuery.refetch();
        }}
      />
    );
  }

  const account = accountQuery.data;
  const wallet = walletQuery.data;
  const onboardingRequired =
    !account ||
    account.status === "not_started" ||
    account.status === "pending" ||
    account.status === "restricted";

  if (onboardingRequired) {
    return (
      <div className="space-y-5">
        <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
          <div className="flex gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <WalletCards className="size-5" />
            </span>
            <div>
              <h2 className="text-xl font-black">
                {locale === "pt-BR"
                  ? "Ativar Marketlift Payments"
                  : "Activate Marketlift Payments"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {locale === "pt-BR"
                  ? "A verificação e os dados bancários são coletados com segurança pelo Stripe Connect. O Stripe valida CPF/CNPJ, identidade e requisitos de pagamento; o Marketlift não armazena seus documentos ou dados bancários completos."
                  : "Verification and bank details are collected securely by Stripe Connect. Stripe verifies CPF/CNPJ, identity and payment requirements; Marketlift does not store your full identity documents or bank details."}
              </p>
            </div>
          </div>

          {account?.status === "restricted" && (
            <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
              {locale === "pt-BR"
                ? "O Stripe precisa de informações adicionais antes de liberar seus recebimentos."
                : "Stripe needs additional information before payouts can be enabled."}
            </p>
          )}

          {activate.isError && (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {activate.error instanceof Error
                ? activate.error.message
                : locale === "pt-BR"
                  ? "Não foi possível iniciar a verificação."
                  : "Verification could not be started."}
            </p>
          )}

          <Button
            type="button"
            className="mt-5 w-full sm:w-auto"
            disabled={activate.isPending}
            onClick={() => activate.mutate()}
          >
            {activate.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ShieldCheck className="size-4" />
            )}
            {activate.isPending
              ? locale === "pt-BR"
                ? "Abrindo Stripe..."
                : "Opening Stripe..."
              : account
                ? locale === "pt-BR"
                  ? "Continuar verificação no Stripe"
                  : "Continue verification on Stripe"
                : locale === "pt-BR"
                  ? "Verificar e ativar com Stripe"
                  : "Verify and activate with Stripe"}
          </Button>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            {locale === "pt-BR"
              ? "Vendedores pessoa física e empresa seguem o fluxo apropriado do Stripe Connect."
              : "Individual and business sellers are routed through the appropriate Stripe Connect onboarding flow."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-slate-400">
            {locale === "pt-BR" ? "Disponível" : "Available"}
          </p>
          <p className="mt-2 text-2xl font-black text-emerald-700">
            {formatMoney((wallet?.availableCents || 0) / 100, wallet?.currency)}
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-slate-400">
            {locale === "pt-BR" ? "Protegido / pendente" : "Protected / pending"}
          </p>
          <p className="mt-2 text-2xl font-black">
            {formatMoney((wallet?.pendingCents || 0) / 100, wallet?.currency)}
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-slate-400">
            {locale === "pt-BR" ? "Em transferência" : "Transferring"}
          </p>
          <p className="mt-2 text-2xl font-black">
            {formatMoney(
              (wallet?.payoutRequestedCents || 0) / 100,
              wallet?.currency,
            )}
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-slate-400">
            {locale === "pt-BR" ? "Liberado" : "Released"}
          </p>
          <p className="mt-2 text-2xl font-black">
            {formatMoney((wallet?.paidOutCents || 0) / 100, wallet?.currency)}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-slate-100">
              <Landmark className="size-5" />
            </span>
            <div>
              <h2 className="font-black">
                {locale === "pt-BR"
                  ? "Conta de recebimento"
                  : "Payout account"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {account?.payoutDestinationMasked || "Stripe Connect"}
              </p>
              <p className="mt-1 text-xs font-black uppercase text-brand-700">
                Stripe Connect · {account?.status}
              </p>
            </div>
          </div>
          <BadgeCheck className="size-6 text-emerald-600" />
        </div>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
          {locale === "pt-BR"
            ? "O saldo só fica disponível depois da confirmação de entrega e do período de proteção do comprador. Ao sacar, o Marketlift libera os recursos para sua conta conectada do Stripe."
            : "Funds become available only after delivery confirmation and the buyer-protection period. Withdrawing releases the funds to your connected Stripe account."}
        </p>

        <Button
          className="mt-5 w-full sm:w-auto"
          disabled={
            !account?.payoutsEnabled ||
            !wallet?.availableCents ||
            withdraw.isPending
          }
          onClick={() => withdraw.mutate()}
        >
          {withdraw.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Banknote className="size-4" />
          )}
          {locale === "pt-BR"
            ? "Liberar saldo disponível"
            : "Release available balance"}
        </Button>

        {withdraw.isSuccess && (
          <p className="mt-3 text-sm font-bold text-emerald-700">
            {locale === "pt-BR" ? "Valor liberado" : "Funds released"}:{" "}
            {formatMoney(
              withdraw.data.amountCents / 100,
              wallet?.currency,
            )}
            .
          </p>
        )}
        {withdraw.isError && (
          <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {withdraw.error instanceof Error
              ? withdraw.error.message
              : locale === "pt-BR"
                ? "Não foi possível liberar o saldo."
                : "Funds could not be released."}
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/selling/orders"
          className="rounded-3xl border bg-white p-5 shadow-sm transition hover:border-brand-300"
        >
          <PackageCheck className="size-5 text-brand-700" />
          <h3 className="mt-3 font-black">
            {locale === "pt-BR" ? "Pedidos recebidos" : "Received orders"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {locale === "pt-BR"
              ? "Processar pedidos, adicionar rastreamento e acompanhar liberações."
              : "Process orders, add tracking and monitor releases."}
          </p>
        </Link>
        <Link
          href="/selling/online-sales"
          className="rounded-3xl border bg-white p-5 shadow-sm transition hover:border-brand-300"
        >
          <WalletCards className="size-5 text-brand-700" />
          <h3 className="mt-3 font-black">
            {locale === "pt-BR"
              ? "Configurar vendas online"
              : "Configure online sales"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {locale === "pt-BR"
              ? "Escolha quais anúncios elegíveis aceitam checkout e como serão entregues."
              : "Choose which eligible listings accept checkout and how they are fulfilled."}
          </p>
        </Link>
      </div>
    </div>
  );
}
