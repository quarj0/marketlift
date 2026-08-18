'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Eye,
  Languages,
  LockKeyhole,
  Mail,
  MessageCircle,
  Shield,
  Smartphone,
} from 'lucide-react';
import { useState } from 'react';
import { AccountSidebar } from '@/components/account/account-sidebar';
import { MarketplaceShell } from '@/components/layout/marketplace-shell';
import { Button } from '@/components/ui/button';
import { accountService } from '@/services/account.service';
import type { AccountSettings } from '@/types';

type ToggleProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  label: string;
};

function Toggle({ checked, onChange, disabled, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
        checked ? 'bg-brand-600' : 'bg-slate-200'
      } disabled:opacity-50`}
    >
      <span
        className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition ${
          checked ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  );
}

type SettingRowProps = {
  icon: typeof Bell;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
};

function SettingRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: SettingRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="flex min-w-0 gap-3">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">
          <Icon className="size-4 text-slate-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold">{title}</p>
          <p className="mt-0.5 max-w-xl text-sm leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>
      <Toggle label={title} checked={checked} onChange={onChange} />
    </div>
  );
}

function SettingsEditor({ initialSettings }: { initialSettings: AccountSettings }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AccountSettings>(initialSettings);
  const [saved, setSaved] = useState(false);

  const mutation = useMutation({
    mutationFn: accountService.updateSettings,
    onSuccess: (data) => {
      setForm(data);
      queryClient.setQueryData(['account', 'settings'], data);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    },
  });

  const update = <K extends keyof AccountSettings>(
    key: K,
    value: AccountSettings[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50">
            <Bell className="size-5 text-brand-700" />
          </div>
          <div>
            <h2 className="font-extrabold">Notifications</h2>
            <p className="text-sm text-slate-500">
              Choose how Marketlift keeps you informed.
            </p>
          </div>
        </div>

        <div className="mt-4 divide-y">
          <SettingRow
            icon={MessageCircle}
            title="Email for new messages"
            description="Receive an email when another Marketlift user sends you a new message."
            checked={form.emailMessages}
            onChange={(value) => update('emailMessages', value)}
          />
          <SettingRow
            icon={Mail}
            title="Listing updates by email"
            description="Receive publication, review, expiry and other important listing updates."
            checked={form.emailListingUpdates}
            onChange={(value) => update('emailListingUpdates', value)}
          />
          <SettingRow
            icon={Smartphone}
            title="Push message notifications"
            description="Show browser or PWA alerts for new marketplace messages."
            checked={form.pushMessages}
            onChange={(value) => update('pushMessages', value)}
          />
          <SettingRow
            icon={Bell}
            title="Push listing updates"
            description="Get important status changes for your listings on supported devices."
            checked={form.pushListingUpdates}
            onChange={(value) => update('pushListingUpdates', value)}
          />
          <SettingRow
            icon={Mail}
            title="Recommendations"
            description="Occasional suggestions based on categories and listings you browse."
            checked={form.emailRecommendations}
            onChange={(value) => update('emailRecommendations', value)}
          />
          <SettingRow
            icon={Mail}
            title="Marketing emails"
            description="Product announcements, campaigns and optional Marketlift promotions."
            checked={form.marketingEmails}
            onChange={(value) => update('marketingEmails', value)}
          />
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100">
            <Shield className="size-5 text-slate-700" />
          </div>
          <div>
            <h2 className="font-extrabold">Privacy</h2>
            <p className="text-sm text-slate-500">
              Decide what other marketplace users can see.
            </p>
          </div>
        </div>

        <div className="mt-4 divide-y">
          <SettingRow
            icon={Eye}
            title="Show online status"
            description="Allow people in your conversations to see when you are active."
            checked={form.showOnlineStatus}
            onChange={(value) => update('showOnlineStatus', value)}
          />
          <SettingRow
            icon={Smartphone}
            title="Allow phone sharing"
            description="Permit your phone number to be revealed through supported contact actions. It is never shown automatically."
            checked={form.showPhoneToSellers}
            onChange={(value) => update('showPhoneToSellers', value)}
          />
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100">
            <Languages className="size-5 text-slate-700" />
          </div>
          <div>
            <h2 className="font-extrabold">Language & region</h2>
            <p className="text-sm text-slate-500">
              Marketlift is currently being built in English with pt-BR localization support.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-semibold">Language</span>
            <select
              value={form.language}
              onChange={(event) =>
                update('language', event.target.value as AccountSettings['language'])
              }
              className="h-11 w-full rounded-xl border bg-white px-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="en">English</option>
              <option value="pt-BR">Português (Brasil)</option>
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold">Currency</span>
            <select
              value={form.currency}
              disabled
              className="h-11 w-full rounded-xl border bg-slate-50 px-3.5 text-sm text-slate-600"
            >
              <option value="BRL">Brazilian Real (R$)</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 size-5 text-slate-500" />
          <div>
            <h2 className="font-bold">Security</h2>
            <p className="mt-1 text-sm text-slate-500">
              Password changes, verified contact methods and future session management belong here.
            </p>
            <Button variant="outline" className="mt-4" disabled>
              Change password
            </Button>
          </div>
        </div>
      </section>

      <div className="sticky bottom-20 flex items-center justify-between gap-3 rounded-2xl border bg-white/95 p-4 shadow-lg backdrop-blur md:bottom-4">
        <div className="min-w-0">
          <p className="text-sm font-bold">Account preferences</p>
          <p className="text-xs text-slate-500" role="status" aria-live="polite">
            {saved
              ? 'Settings saved successfully.'
              : 'Changes are saved to the mocked account service.'}
          </p>
        </div>
        <Button
          disabled={mutation.isPending}
          loading={mutation.isPending}
          loadingText="Saving…"
          onClick={() => mutation.mutate(form)}
        >
          Save settings
        </Button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const settingsQuery = useQuery({
    queryKey: ['account', 'settings'],
    queryFn: accountService.getSettings,
  });

  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
        <div className="mb-5 sm:mb-7">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Settings</h1>
          <p className="mt-1 text-slate-500">
            Control notifications, privacy and marketplace preferences.
          </p>
        </div>

        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <AccountSidebar />

          {settingsQuery.isLoading ? (
            <div className="space-y-4 rounded-2xl border bg-white p-6" aria-busy="true">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : settingsQuery.isError || !settingsQuery.data ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
              <h2 className="font-bold text-rose-900">Could not load settings</h2>
              <Button
                variant="outline"
                className="mt-4 bg-white"
                onClick={() => settingsQuery.refetch()}
              >
                Try again
              </Button>
            </div>
          ) : (
            <SettingsEditor
              key={JSON.stringify(settingsQuery.data)}
              initialSettings={settingsQuery.data}
            />
          )}
        </div>
      </main>
    </MarketplaceShell>
  );
}
