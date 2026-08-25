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
  LockKeyhole,
  Mail,
  MessageCircle,
  Shield,
  Smartphone,
} from "lucide-react";

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
      } disabled:opacity-50`}
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
}: {
  icon: typeof Bell;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
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
  });

  function update<K extends keyof AccountSettings>(
    key: K,
    value: AccountSettings[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateLanguage(
    language: AccountSettings["language"],
  ) {
    update("language", language);

    // Language is a UI preference, so show the result immediately.
    // Saving below also persists it through the account service.
    setLocale(language);
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
            description={t(
              "settings.emailMessagesBody",
            )}
            checked={form.emailMessages}
            onChange={(value) =>
              update("emailMessages", value)
            }
          />

          <SettingRow
            icon={Mail}
            title={t("settings.emailListing")}
            description={t(
              "settings.emailListingBody",
            )}
            checked={form.emailListingUpdates}
            onChange={(value) =>
              update("emailListingUpdates", value)
            }
          />

          <SettingRow
            icon={Smartphone}
            title={t("settings.pushMessages")}
            description={t(
              "settings.pushMessagesBody",
            )}
            checked={form.pushMessages}
            onChange={(value) =>
              update("pushMessages", value)
            }
          />

          <SettingRow
            icon={Bell}
            title={t("settings.pushListing")}
            description={t(
              "settings.pushListingBody",
            )}
            checked={form.pushListingUpdates}
            onChange={(value) =>
              update("pushListingUpdates", value)
            }
          />

          <SettingRow
            icon={Mail}
            title={t("settings.recommendations")}
            description={t(
              "settings.recommendationsBody",
            )}
            checked={form.emailRecommendations}
            onChange={(value) =>
              update("emailRecommendations", value)
            }
          />

          <SettingRow
            icon={Mail}
            title={t("settings.marketing")}
            description={t(
              "settings.marketingBody",
            )}
            checked={form.marketingEmails}
            onChange={(value) =>
              update("marketingEmails", value)
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
            onChange={(value) =>
              update("showOnlineStatus", value)
            }
          />

          <SettingRow
            icon={Smartphone}
            title={t("settings.phone")}
            description={t("settings.phoneBody")}
            checked={form.showPhoneToSellers}
            onChange={(value) =>
              update("showPhoneToSellers", value)
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
              onChange={(event) =>
                updateLanguage(
                  event.target
                    .value as AccountSettings["language"],
                )
              }
              className="h-11 w-full rounded-xl border bg-white px-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
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

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 size-5 text-slate-500" />

          <div>
            <h2 className="font-bold">
              {t("settings.security")}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {t("settings.securityBody")}
            </p>

            <Button
              type="button"
              variant="outline"
              className="mt-4"
              disabled
            >
              {t("settings.changePassword")}
            </Button>
          </div>
        </div>
      </section>

      <div className="sticky bottom-20 flex items-center justify-between gap-3 rounded-2xl border bg-white/95 p-4 shadow-lg backdrop-blur md:bottom-4">
        <div>
          <p className="text-sm font-bold">
            {t("settings.preferences")}
          </p>

          <p className="text-xs text-slate-500">
            {saved
              ? t("settings.saved")
              : t("settings.unsaved")}
          </p>
        </div>

        <Button
          type="button"
          disabled={mutation.isPending}
          onClick={() =>
            mutation.mutate({
              ...form,
              language: locale,
            })
          }
        >
          {mutation.isPending
            ? t("common.saving")
            : t("settings.save")}
        </Button>
      </div>
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
