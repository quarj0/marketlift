"use client";

import { useState } from "react";
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

  const [form, setForm] =
    useState<AccountSettings>(initialSettings);
  const [saved, setSaved] = useState(false);

  const mutation = useMutation({
    mutationFn: accountService.updateSettings,

    onMutate: (next) => {
      const previous = form;
      setForm({ ...form, ...next });
      setSaved(false);
      return { previous };
    },

    onSuccess: (data) => {
      setForm(data);
      setLocale(data.language);

      queryClient.setQueryData(
        ["account", "settings"],
        data,
      );

      setSaved(true);
      window.setTimeout(
        () => setSaved(false),
        2200,
      );
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        setForm(context.previous);
        setLocale(context.previous.language);
      }
    },
  });

  function persist<K extends keyof AccountSettings>(
    key: K,
    value: AccountSettings[K],
  ) {
    if (mutation.isPending) return;
    mutation.mutate({
      ...form,
      [key]: value,
      language: locale,
    });
  }

  function updateLanguage(
    language: AccountSettings["language"],
  ) {
    if (mutation.isPending) return;
    setLocale(language);
    mutation.mutate({
      ...form,
      language,
    });
  }

  const settingPending = mutation.isPending;

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
            description={t(
              "settings.emailMessagesBody",
            )}
            checked={form.emailMessages}
            disabled={settingPending}
            onChange={(value) =>
              persist("emailMessages", value)
            }
          />

          <SettingRow
            icon={Mail}
            title={t("settings.emailListing")}
            description={t(
              "settings.emailListingBody",
            )}
            checked={form.emailListingUpdates}
            disabled={settingPending}
            onChange={(value) =>
              persist("emailListingUpdates", value)
            }
          />

          <SettingRow
            icon={Smartphone}
            title={t("settings.pushMessages")}
            description={t(
              "settings.pushMessagesBody",
            )}
            checked={form.pushMessages}
            disabled={settingPending}
            onChange={(value) =>
              persist("pushMessages", value)
            }
          />

          <SettingRow
            icon={Bell}
            title={t("settings.pushListing")}
            description={t(
              "settings.pushListingBody",
            )}
            checked={form.pushListingUpdates}
            disabled={settingPending}
            onChange={(value) =>
              persist("pushListingUpdates", value)
            }
          />

          <SettingRow
            icon={Mail}
            title={t("settings.recommendations")}
            description={t(
              "settings.recommendationsBody",
            )}
            checked={form.emailRecommendations}
            disabled={settingPending}
            onChange={(value) =>
              persist("emailRecommendations", value)
            }
          />

          <SettingRow
            icon={Mail}
            title={t("settings.marketing")}
            description={t(
              "settings.marketingBody",
            )}
            checked={form.marketingEmails}
            disabled={settingPending}
            onChange={(value) =>
              persist("marketingEmails", value)
            }
          />
        </div>
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
            disabled={settingPending}
            onChange={(value) =>
              persist("showOnlineStatus", value)
            }
          />

          <SettingRow
            icon={Smartphone}
            title={t("settings.phone")}
            description={t("settings.phoneBody")}
            checked={form.showPhoneToSellers}
            disabled={settingPending}
            onChange={(value) =>
              persist("showPhoneToSellers", value)
            }
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
              disabled={settingPending}
              onChange={(event) =>
                updateLanguage(
                  event.target
                    .value as AccountSettings["language"],
                )
              }
              className="h-11 w-full rounded-xl border bg-white px-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="en">
                {t("settings.english")}
              </option>

              <option value="pt-BR">
                {t("settings.portuguese")}
              </option>
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

      {mutation.isPending && (
        <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800" role="status">
          {t("common.saving")}
        </div>
      )}

      {saved && !mutation.isPending && (
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
                {Array.from({ length: 6 }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="h-16 animate-pulse rounded-xl bg-slate-100"
                    />
                  ),
                )}
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
                  onClick={() =>
                    settingsQuery.refetch()
                  }
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
