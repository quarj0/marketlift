"use client";

import { useEffect, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Bell,
  Eye,
  Languages,
  Mail,
  MessageCircle,
  Shield,
  Smartphone,
} from "lucide-react";

import { AccountSecurityControls } from "@/components/account/account-security-controls";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/providers/locale-provider";
import { useMarket } from "@/providers/market-provider";
import { accountService } from "@/services/account.service";
import { webPushService } from "@/services/web-push.service";
import type { AccountSettings } from "@/types";

function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
        checked ? "bg-brand-600" : "bg-slate-200"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <span
        className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  icon: typeof Bell;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="flex gap-3">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">
          <Icon className="size-4 text-slate-600" />
        </div>

        <div>
          <p className="text-sm font-bold">
            {title}
          </p>

          <p className="mt-0.5 max-w-xl text-sm leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <Toggle
        label={title}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

function SettingsForm({
  initialSettings,
}: {
  initialSettings: AccountSettings;
}) {
  const queryClient = useQueryClient();
  const { t, locale, setLocale } = useLocale();
  const { market } = useMarket();

  const [form, setForm] = useState<AccountSettings>(initialSettings);
  const [saved, setSaved] = useState(false);
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(() => new Set());
  const [notificationNotice, setNotificationNotice] = useState<string | null>(null);
  const [pushDeviceStatus, setPushDeviceStatus] = useState<Awaited<ReturnType<typeof webPushService.getStatus>> | null>(null);

  const mutation = useMutation({
    mutationFn: accountService.updateSettings,

    onSuccess: (data, variables) => {
      const changedKeys = Object.keys(variables) as (keyof AccountSettings)[];
      setForm((current) => {
        const next = { ...current };
        for (const key of changedKeys) next[key] = data[key] as never;
        return next;
      });
      queryClient.setQueryData<AccountSettings>(
        ["account", "settings"],
        (current) => {
          if (!current) return data;
          const next = { ...current };
          for (const key of changedKeys) next[key] = data[key] as never;
          return next;
        },
      );
      if (variables.language) setLocale(data.language);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    },
  });

  function isPending(key: string) {
    return pendingKeys.has(key);
  }

  function setPending(key: string, value: boolean) {
    setPendingKeys((current) => {
      const next = new Set(current);
      if (value) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  const pushBusy =
    isPending("pushMessages") ||
    isPending("pushListingUpdates") ||
    isPending("pushDevice");

  async function refreshPushDeviceStatus(reconcile = false) {
    try {
      if (reconcile && (form.pushMessages || form.pushListingUpdates)) {
        await webPushService.reconcile(true);
      }
      setPushDeviceStatus(await webPushService.getStatus());
    } catch {
      setPushDeviceStatus(await webPushService.getStatus());
    }
  }

  useEffect(() => {
    void refreshPushDeviceStatus(true);
    // Only reconcile this device when the settings screen is opened.
    // Reconciliation never triggers a browser permission prompt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function persist<K extends keyof AccountSettings>(
    key: K,
    value: AccountSettings[K],
  ) {
    if (isPending(String(key))) return;
    const previous = form[key];
    setPending(String(key), true);
    setSaved(false);
    setForm((current) => ({ ...current, [key]: value }));
    try {
      await mutation.mutateAsync({ [key]: value } as Partial<AccountSettings>);
    } catch {
      setForm((current) => ({ ...current, [key]: previous }));
    } finally {
      setPending(String(key), false);
    }
  }

  async function persistBrowserNotification(
    key: "pushMessages" | "pushListingUpdates",
    value: boolean,
  ) {
    if (pushBusy) return;
    const previous = form[key];
    setPending(key, true);
    setNotificationNotice(null);
    setSaved(false);
    setForm((current) => ({ ...current, [key]: value }));

    try {
      if (value) {
        await webPushService.enable();
      }

      const updated = await mutation.mutateAsync({ [key]: value });
      if (!updated.pushMessages && !updated.pushListingUpdates) {
        await webPushService.removeSubscription();
      }
      await refreshPushDeviceStatus(false);
    } catch (error) {
      setForm((current) => ({ ...current, [key]: previous }));
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      setNotificationNotice(
        locale === "pt-BR"
          ? message.includes("permission")
            ? "As notificações estão bloqueadas neste navegador. Permita notificações nas configurações do site e tente novamente."
            : "Não foi possível ativar as notificações neste dispositivo. Tente novamente."
          : message.includes("permission")
            ? "Notifications are blocked in this browser. Allow them in the site settings and try again."
            : "Browser notifications could not be enabled on this device. Please try again.",
      );
      await refreshPushDeviceStatus(false);
    } finally {
      setPending(key, false);
    }
  }

  async function enablePushOnThisDevice() {
    if (pushBusy) return;
    setPending("pushDevice", true);
    setNotificationNotice(null);
    try {
      await webPushService.enable();
      await refreshPushDeviceStatus(false);
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      setNotificationNotice(
        locale === "pt-BR"
          ? message.includes("permission")
            ? "As notificações estão bloqueadas neste navegador. Altere a permissão do site nas configurações do navegador."
            : "Não foi possível registrar este dispositivo para notificações."
          : message.includes("permission")
            ? "Notifications are blocked in this browser. Change this site's notification permission in your browser settings."
            : "This device could not be registered for browser notifications.",
      );
    } finally {
      setPending("pushDevice", false);
    }
  }

  async function updateLanguage(
    language: AccountSettings["language"],
  ) {
    if (isPending("language")) return;
    const previous = form.language;
    setPending("language", true);
    setLocale(language);
    setForm((current) => ({ ...current, language }));
    try {
      await mutation.mutateAsync({ language });
    } catch {
      setForm((current) => ({ ...current, language: previous }));
      setLocale(previous);
    } finally {
      setPending("language", false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50">
            <Bell className="size-5 text-brand-700" />
          </div>

          <div>
            <h2 className="font-extrabold">
              {t("settings.notifications")}
            </h2>

            <p className="text-sm text-slate-500">
              {t("settings.notificationsBody")}
            </p>
          </div>
        </div>

        <div className="mt-4 divide-y">
          <SettingRow
            icon={MessageCircle}
            title={t("settings.emailMessages")}
            description={t("settings.emailMessagesBody")}
            checked={form.emailMessages}
            disabled={isPending("emailMessages")}
            onChange={(value) => void persist("emailMessages", value)}
          />

          <SettingRow
            icon={Mail}
            title={t("settings.emailListing")}
            description={t("settings.emailListingBody")}
            checked={form.emailListingUpdates}
            disabled={isPending("emailListingUpdates")}
            onChange={(value) => void persist("emailListingUpdates", value)}
          />

          <SettingRow
            icon={Smartphone}
            title={t("settings.pushMessages")}
            description={t("settings.pushMessagesBody")}
            checked={form.pushMessages}
            disabled={pushBusy}
            onChange={(value) => void persistBrowserNotification("pushMessages", value)}
          />

          <SettingRow
            icon={Bell}
            title={t("settings.pushListing")}
            description={t("settings.pushListingBody")}
            checked={form.pushListingUpdates}
            disabled={pushBusy}
            onChange={(value) => void persistBrowserNotification("pushListingUpdates", value)}
          />

          <SettingRow
            icon={Mail}
            title={t("settings.recommendations")}
            description={t("settings.recommendationsBody")}
            checked={form.emailRecommendations}
            disabled={isPending("emailRecommendations")}
            onChange={(value) => void persist("emailRecommendations", value)}
          />

          <SettingRow
            icon={Mail}
            title={t("settings.marketing")}
            description={t("settings.marketingBody")}
            checked={form.marketingEmails}
            disabled={isPending("marketingEmails")}
            onChange={(value) => void persist("marketingEmails", value)}
          />
        </div>

        {notificationNotice && (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900" role="status">
            {notificationNotice}
          </p>
        )}

        {pushDeviceStatus && (
          <div className="mt-3 flex flex-col gap-2 border-t pt-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>
              {!pushDeviceStatus.supported
                ? locale === "pt-BR"
                  ? "Este navegador não oferece suporte a notificações push."
                  : "This browser does not support push notifications."
                : pushDeviceStatus.subscribed
                  ? locale === "pt-BR"
                    ? "Este dispositivo está registrado para notificações do Marketlift."
                    : "This device is registered for Marketlift notifications."
                  : pushDeviceStatus.permission === "denied"
                    ? locale === "pt-BR"
                      ? "As notificações estão bloqueadas neste navegador."
                      : "Notifications are blocked in this browser."
                    : form.pushMessages || form.pushListingUpdates
                      ? locale === "pt-BR"
                        ? "As preferências estão ativas, mas este dispositivo ainda não está registrado."
                        : "Your preferences are on, but this device is not registered yet."
                      : locale === "pt-BR"
                        ? "Ative uma opção de notificação do navegador para registrar este dispositivo."
                        : "Turn on a browser notification option to register this device."}
            </span>
            {pushDeviceStatus.supported &&
              !pushDeviceStatus.subscribed &&
              (form.pushMessages || form.pushListingUpdates) && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isPending("pushDevice")}
                  onClick={() => void enablePushOnThisDevice()}
                >
                  {locale === "pt-BR" ? "Ativar neste dispositivo" : "Enable on this device"}
                </Button>
              )}
          </div>
        )}
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100">
            <Shield className="size-5 text-slate-700" />
          </div>

          <div>
            <h2 className="font-extrabold">
              {t("settings.privacy")}
            </h2>

            <p className="text-sm text-slate-500">
              {t("settings.privacyBody")}
            </p>
          </div>
        </div>

        <div className="mt-4 divide-y">
          <SettingRow
            icon={Eye}
            title={t("settings.online")}
            description={t("settings.onlineBody")}
            checked={form.showOnlineStatus}
            disabled={isPending("showOnlineStatus")}
            onChange={(value) => void persist("showOnlineStatus", value)}
          />

          <SettingRow
            icon={Smartphone}
            title={t("settings.phone")}
            description={t("settings.phoneBody")}
            checked={form.showPhoneToSellers}
            disabled={isPending("showPhoneToSellers")}
            onChange={(value) => void persist("showPhoneToSellers", value)}
          />
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50">
            <Languages className="size-5 text-brand-700" />
          </div>

          <div>
            <h2 className="font-extrabold">
              {t("settings.languageRegion")}
            </h2>

            <p className="text-sm text-slate-500">
              {t("settings.languageRegionBody")}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-semibold">
              {t("settings.language")}
            </span>

            <select
              value={locale}
              disabled={isPending("language")}
              onChange={(event) =>
                void updateLanguage(event.target.value as AccountSettings["language"])
              }
              className="h-11 w-full rounded-xl border bg-white px-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="en">{t("settings.english")}</option>
              <option value="pt-BR">{t("settings.portuguese")}</option>
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold">
              {t("settings.currency")}
            </span>

            <select
              value={market.currency}
              disabled
              className="h-11 w-full rounded-xl border bg-slate-50 px-3.5 text-sm text-slate-600"
            >
              <option value={market.currency}>{market.currency} ({market.currencySymbol})</option>
            </select>
          </label>
        </div>
      </section>

      <AccountSecurityControls />

      {pendingKeys.size > 0 && (
        <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800" role="status">
          {t("common.saving")}
        </div>
      )}

      {saved && pendingKeys.size === 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800" role="status">
          {t("settings.saved")}
        </div>
      )}

      {mutation.isError && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {mutation.error.message}
        </p>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { t } = useLocale();

  const settingsQuery = useQuery({
    queryKey: ["account", "settings"],
    queryFn: accountService.getSettings,
  });

  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7">
          <h1 className="text-3xl font-black tracking-tight">
            {t("settings.title")}
          </h1>

          <p className="mt-1 text-slate-500">
            {t("settings.description")}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
          <AccountSidebar />

          <div>
            {settingsQuery.isLoading && (
              <div className="space-y-4 rounded-2xl border bg-white p-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-16 animate-pulse rounded-xl bg-slate-100"
                  />
                ))}
              </div>
            )}

            {settingsQuery.isError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
                <h2 className="font-bold text-rose-900">
                  {t("settings.loadError")}
                </h2>

                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => settingsQuery.refetch()}
                >
                  {t("common.tryAgain")}
                </Button>
              </div>
            )}

            {settingsQuery.data && (
              <SettingsForm
                key={`${settingsQuery.data.language}-${settingsQuery.data.currency}`}
                initialSettings={settingsQuery.data}
              />
            )}
          </div>
        </div>
      </main>
    </MarketplaceShell>
  );
}
