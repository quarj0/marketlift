"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Banknote, ExternalLink, Landmark, Loader2, PackageCheck, ShieldCheck, WalletCards } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InlineError, PageLoading } from "@/components/feedback/async-states";
import { UpcomingFeature } from "@/components/feedback/upcoming-feature";
import { commerceService } from "@/services/commerce.service";
import { useAuth } from "@/providers/auth-provider";
import { useMarket } from "@/providers/market-provider";
import { useLocale } from "@/providers/locale-provider";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>{children}</label>;
}

export function SellerPaymentsClient() {
  const { user } = useAuth();
  const { formatMoney, paymentsEnabledForMarket } = useMarket();
  const { locale } = useLocale();
  const queryClient = useQueryClient();
  const paymentsEnabled = user?.countryCode === "BR" && paymentsEnabledForMarket(user?.countryCode);
  const isBusinessSeller = user?.sellerProfile?.sellerType === "business";
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
  const [form, setForm] = useState({
    name: user?.name || "", cpf: "", motherName: "", birthdate: "", monthlyIncome: "", occupation: "",
    phone: "", street: "", streetNumber: "", complement: "Sem complemento", neighborhood: "", city: "", state: "", zipCode: "", referencePoint: "Não informado",
    bank: "", branch: "", branchDigit: "", account: "", accountDigit: "", accountType: "checking",
  });
  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const activate = useMutation({
    mutationFn: async () => {
      const rawPhone = form.phone.trim();
      const digits = rawPhone.replace(/\D/g, "");
      const hasCountryPrefix = rawPhone.startsWith("+55") || (digits.length > 11 && digits.startsWith("55"));
      const phoneDigits = hasCountryPrefix ? digits.slice(2) : digits;
      const cpf = form.cpf.replace(/\D/g, "");
      return commerceService.activateSellerPayments({
        register_information: {
          name: form.name,
          email: user?.email || "",
          document: cpf,
          type: "individual",
          site_url: `https://marketlift.com.br/seller/${user?.sellerProfile?.sellerId || "profile"}`,
          mother_name: form.motherName,
          birthdate: form.birthdate ? `${form.birthdate}T00:00:00` : "",
          monthly_income: Number(form.monthlyIncome || 0) * 100,
          professional_occupation: form.occupation,
          address: {
            street: form.street,
            complementary: form.complement || "Sem complemento",
            street_number: form.streetNumber,
            neighborhood: form.neighborhood,
            city: form.city,
            state: form.state.toUpperCase(),
            zip_code: form.zipCode.replace(/\D/g, ""),
            reference_point: form.referencePoint || "Não informado",
          },
          phone_numbers: [{ ddd: phoneDigits.slice(0, 2), number: phoneDigits.slice(2), type: "mobile" }],
        },
        default_bank_account: {
          holder_name: form.name,
          holder_type: "individual",
          holder_document: cpf,
          bank: form.bank,
          branch_number: form.branch,
          branch_check_digit: form.branchDigit,
          account_number: form.account,
          account_check_digit: form.accountDigit,
          type: form.accountType,
        },
        transfer_settings: { transfer_enabled: false, transfer_interval: "Daily", transfer_day: 0 },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["seller-payment-account"] }),
  });

  const withdraw = useMutation({
    mutationFn: commerceService.withdrawSellerBalance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-wallet"] });
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
    },
  });

  if (!paymentsEnabled) return <UpcomingFeature feature="payments" />;

  if (isBusinessSeller) {
    return (
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black">
          {locale === "pt-BR" ? "Recebimentos para empresas" : "Business payouts"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {locale === "pt-BR"
            ? "O onboarding automático atual aceita vendedores pessoa física. Para não cadastrar uma empresa com dados de pessoa física, o checkout fica bloqueado até concluirmos o fluxo CNPJ do Pagar.me."
            : "Automated onboarding currently supports individual sellers only. To avoid registering a company with personal-recipient data, checkout remains unavailable until the Pagar.me CNPJ flow is implemented."}
        </p>
      </div>
    );
  }

  if (accountQuery.isLoading || walletQuery.isLoading) return <PageLoading label={locale === "pt-BR" ? "Carregando Marketlift Payments..." : "Loading Marketlift Payments..."} />;
  if (accountQuery.isError || walletQuery.isError) return <InlineError title={locale === "pt-BR" ? "Não foi possível carregar pagamentos" : "Payments could not be loaded"} description={locale === "pt-BR" ? "Tente novamente." : "Please try again."} onRetry={() => { accountQuery.refetch(); walletQuery.refetch(); }} />;

  const account = accountQuery.data;
  const wallet = walletQuery.data;

  if (!account || account.status === "not_started") {
    const submit = (event: FormEvent) => { event.preventDefault(); activate.mutate(); };
    return (
      <form onSubmit={submit} className="space-y-5">
        <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
          <div className="flex gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-700"><WalletCards className="size-5" /></span><div><h2 className="text-xl font-black">{locale === "pt-BR" ? "Ativar Marketlift Payments" : "Activate Marketlift Payments"}</h2><p className="mt-1 text-sm text-slate-500">{locale === "pt-BR" ? "Cadastre seus dados uma vez. O Pagar.me cria seu recebedor e faz a verificação regulatória; o Marketlift mostra saldo e pedidos sem exigir outro painel do vendedor." : "Enter your details once. Pagar.me creates and verifies the recipient while Marketlift keeps balances and orders in one place."}</p></div></div>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
          <h3 className="font-black">{locale === "pt-BR" ? "Dados pessoais" : "Personal details"}</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label={locale === "pt-BR" ? "Nome completo" : "Full name"}><Input value={form.name} onChange={update("name")} required /></Field>
            <Field label="CPF"><Input value={form.cpf} onChange={update("cpf")} inputMode="numeric" required /></Field>
            <Field label={locale === "pt-BR" ? "Nome da mãe" : "Mother's name"}><Input value={form.motherName} onChange={update("motherName")} required /></Field>
            <Field label={locale === "pt-BR" ? "Data de nascimento" : "Date of birth"}><Input type="date" value={form.birthdate} onChange={update("birthdate")} required /></Field>
            <Field label={locale === "pt-BR" ? "Renda mensal (R$)" : "Monthly income (R$)"}><Input type="number" min="0" value={form.monthlyIncome} onChange={update("monthlyIncome")} required /></Field>
            <Field label={locale === "pt-BR" ? "Ocupação" : "Occupation"}><Input value={form.occupation} onChange={update("occupation")} required /></Field>
            <Field label={locale === "pt-BR" ? "Celular com DDD" : "Mobile number with area code"}><Input value={form.phone} onChange={update("phone")} inputMode="tel" required /></Field>
          </div>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
          <h3 className="font-black">{locale === "pt-BR" ? "Endereço" : "Address"}</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="CEP"><Input value={form.zipCode} onChange={update("zipCode")} required /></Field>
            <Field label={locale === "pt-BR" ? "Rua" : "Street"}><Input value={form.street} onChange={update("street")} required /></Field>
            <Field label={locale === "pt-BR" ? "Número" : "Number"}><Input value={form.streetNumber} onChange={update("streetNumber")} required /></Field>
            <Field label={locale === "pt-BR" ? "Complemento" : "Complement"}><Input value={form.complement} onChange={update("complement")} required /></Field>
            <Field label={locale === "pt-BR" ? "Bairro" : "District"}><Input value={form.neighborhood} onChange={update("neighborhood")} required /></Field>
            <Field label={locale === "pt-BR" ? "Cidade" : "City"}><Input value={form.city} onChange={update("city")} required /></Field>
            <Field label="UF"><Input value={form.state} onChange={update("state")} maxLength={2} required /></Field>
            <Field label={locale === "pt-BR" ? "Ponto de referência" : "Reference point"}><Input value={form.referencePoint} onChange={update("referencePoint")} required /></Field>
          </div>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
          <h3 className="font-black">{locale === "pt-BR" ? "Conta para receber" : "Payout bank account"}</h3>
          <p className="mt-1 text-sm text-slate-500">{locale === "pt-BR" ? "O saque será enviado pelo Pagar.me para esta conta bancária. O Marketlift não armazena seus dados bancários completos depois do cadastro." : "Pagar.me sends withdrawals to this bank account. Marketlift does not retain the complete bank details after onboarding."}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label={locale === "pt-BR" ? "Código do banco" : "Bank code"}><Input value={form.bank} onChange={update("bank")} placeholder="Ex.: 260" required /></Field>
            <Field label={locale === "pt-BR" ? "Agência" : "Branch"}><Input value={form.branch} onChange={update("branch")} required /></Field>
            <Field label={locale === "pt-BR" ? "Dígito da agência" : "Branch digit"}><Input value={form.branchDigit} onChange={update("branchDigit")} /></Field>
            <Field label={locale === "pt-BR" ? "Conta" : "Account"}><Input value={form.account} onChange={update("account")} required /></Field>
            <Field label={locale === "pt-BR" ? "Dígito da conta" : "Account digit"}><Input value={form.accountDigit} onChange={update("accountDigit")} required /></Field>
            <Field label={locale === "pt-BR" ? "Tipo" : "Type"}><select value={form.accountType} onChange={update("accountType")} className="min-h-11 w-full rounded-xl border bg-white px-3"><option value="checking">{locale === "pt-BR" ? "Conta corrente" : "Checking"}</option><option value="savings">{locale === "pt-BR" ? "Poupança" : "Savings"}</option></select></Field>
          </div>
          {activate.isError && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{activate.error instanceof Error ? activate.error.message : (locale === "pt-BR" ? "Não foi possível ativar pagamentos." : "Payments could not be activated.")}</p>}
          <Button type="submit" className="mt-5 w-full" disabled={activate.isPending}>{activate.isPending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />} {activate.isPending ? (locale === "pt-BR" ? "Enviando para verificação..." : "Submitting for verification...") : (locale === "pt-BR" ? "Ativar pagamentos" : "Activate payments")}</Button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase text-slate-400">{locale === "pt-BR" ? "Disponível" : "Available"}</p><p className="mt-2 text-2xl font-black text-emerald-700">{formatMoney((wallet?.availableCents || 0) / 100, wallet?.currency)}</p></div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase text-slate-400">{locale === "pt-BR" ? "Pendente" : "Pending"}</p><p className="mt-2 text-2xl font-black">{formatMoney((wallet?.pendingCents || 0) / 100, wallet?.currency)}</p></div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase text-slate-400">{locale === "pt-BR" ? "Saque solicitado" : "Withdrawal requested"}</p><p className="mt-2 text-2xl font-black">{formatMoney((wallet?.payoutRequestedCents || 0) / 100, wallet?.currency)}</p></div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase text-slate-400">{locale === "pt-BR" ? "Já recebido" : "Paid out"}</p><p className="mt-2 text-2xl font-black">{formatMoney((wallet?.paidOutCents || 0) / 100, wallet?.currency)}</p></div>
      </div>

      <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-slate-100"><Landmark className="size-5" /></span><div><h2 className="font-black">{locale === "pt-BR" ? "Conta de recebimento" : "Payout account"}</h2><p className="mt-1 text-sm text-slate-500">{account.payoutDestinationMasked || (locale === "pt-BR" ? "Conta cadastrada no Pagar.me" : "Account registered with Pagar.me")}</p><p className="mt-1 text-xs font-black uppercase text-brand-700">Status: {account.status}</p></div></div>
          {account.status === "active" && <BadgeCheck className="size-6 text-emerald-600" />}
        </div>
        {account.kycUrl && account.status !== "active" && <Button asChild className="mt-5"><a href={account.kycUrl} target="_blank" rel="noreferrer">{locale === "pt-BR" ? "Concluir verificação no Pagar.me" : "Complete Pagar.me verification"} <ExternalLink className="size-4" /></a></Button>}
        <Button className="mt-5 w-full sm:w-auto" disabled={!account.payoutsEnabled || !wallet?.availableCents || withdraw.isPending} onClick={() => withdraw.mutate()}>{withdraw.isPending ? <Loader2 className="size-4 animate-spin" /> : <Banknote className="size-4" />} {locale === "pt-BR" ? "Sacar saldo disponível" : "Withdraw available balance"}</Button>
        {withdraw.isSuccess && <p className="mt-3 text-sm font-bold text-emerald-700">{locale === "pt-BR" ? "Saque solicitado" : "Withdrawal requested"}: {formatMoney(withdraw.data.amountCents / 100, wallet?.currency)}.</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/selling/orders" className="rounded-3xl border bg-white p-5 shadow-sm transition hover:border-brand-300"><PackageCheck className="size-5 text-brand-700" /><h3 className="mt-3 font-black">{locale === "pt-BR" ? "Pedidos recebidos" : "Received orders"}</h3><p className="mt-1 text-sm text-slate-500">{locale === "pt-BR" ? "Processar pedidos, adicionar rastreamento e acompanhar liberações." : "Process orders, add tracking and monitor releases."}</p></Link>
        <Link href="/selling/online-sales" className="rounded-3xl border bg-white p-5 shadow-sm transition hover:border-brand-300"><WalletCards className="size-5 text-brand-700" /><h3 className="mt-3 font-black">{locale === "pt-BR" ? "Configurar vendas online" : "Configure online sales"}</h3><p className="mt-1 text-sm text-slate-500">{locale === "pt-BR" ? "Escolha quais anúncios elegíveis aceitam checkout e como serão entregues." : "Choose which eligible listings accept checkout and how they are fulfilled."}</p></Link>
      </div>
    </div>
  );
}
