"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Camera, Eye, Loader2 } from "lucide-react";

import { LocationFields } from "@/components/location/location-fields";
import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { SellerAvatar } from "@/components/seller/seller-avatar";
import { SellingSidebar } from "@/components/selling/selling-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";
import { useLocale } from "@/providers/locale-provider";
import { useMarket } from "@/providers/market-provider";
import { accountService } from "@/services/account.service";
import { sellerService } from "@/services/seller.service";
import type { SellerType } from "@/types";

export default function SellingProfilePage() {
  const { t } = useLocale();
  const { market } = useMarket();
  const { user, hydrated, refreshSession } = useAuth();
  const queryClient = useQueryClient();
  const sellerId = user?.sellerProfile?.sellerId ?? "";
  const [form, setForm] = useState({
    displayName: "",
    sellerType: "individual" as SellerType,
    phone: "",
    stateName: "",
    stateCode: "",
    city: "",
    district: "",
    bio: "",
  });
  const [saved, setSaved] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["account", "profile"],
    queryFn: accountService.getProfile,
    enabled: hydrated && Boolean(user),
  });
  const sellerQuery = useQuery({
    queryKey: ["seller", sellerId],
    queryFn: () => sellerService.getSeller(sellerId),
    enabled: Boolean(sellerId),
  });

  useEffect(() => {
    if (!profileQuery.data || !sellerQuery.data) return;
    const profile = profileQuery.data;
    const seller = sellerQuery.data;
    const frame = window.requestAnimationFrame(() => {
      setForm({
        displayName: seller.name || profile.fullName,
        sellerType: seller.type ?? "individual",
        phone: profile.phone || "",
        stateName: profile.location.state || "",
        stateCode: profile.location.stateCode || "",
        city: profile.location.city || "",
        district: profile.location.district || "",
        bio: profile.bio || "",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [profileQuery.data, sellerQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const [seller, profile] = await Promise.all([
        sellerService.updateMyProfile({
          displayName: form.displayName.trim(),
          sellerType: form.sellerType,
        }),
        accountService.updateProfile({
          phone: form.phone.trim(),
          bio: form.bio.trim(),
          location: {
            countryCode:
              profileQuery.data?.location.countryCode ||
              user?.countryCode ||
              market.code,
            state: form.stateName || form.stateCode,
            stateCode: form.stateCode,
            city: form.city.trim(),
            district: form.district.trim(),
          },
        }),
      ]);
      return { seller, profile };
    },
    onSuccess: ({ seller, profile }) => {
      queryClient.setQueryData(["seller", sellerId], seller);
      queryClient.setQueryData(["account", "profile"], profile);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
      void refreshSession();
    },
  });

  const avatarMutation = useMutation({
    mutationFn: accountService.updateAvatar,
    onSuccess: (profile) => {
      queryClient.setQueryData(["account", "profile"], profile);
      void queryClient.invalidateQueries({ queryKey: ["seller", sellerId] });
      void refreshSession();
    },
  });

  const loading = !hydrated || profileQuery.isLoading || sellerQuery.isLoading;
  const seller = sellerQuery.data;
  const profile = profileQuery.data;
  const locationLabel = [form.city, form.stateCode].filter(Boolean).join(", ");

  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
        <div className="mb-5 sm:mb-7">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-700">
            {t("selling.eyebrow")}
          </p>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            {t("selling.profile.title")}
          </h1>
          <p className="mt-1 text-slate-500">{t("selling.profile.body")}</p>
        </div>

        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <SellingSidebar />
          <div className="space-y-6">
            {loading ? (
              <section className="grid min-h-64 place-items-center rounded-2xl border bg-white shadow-sm">
                <Loader2
                  className="size-6 animate-spin text-brand-600"
                  aria-label={t("common.loading")}
                />
              </section>
            ) : !seller || !profile ? (
              <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
                <p className="font-semibold">{t("common.error")}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    void profileQuery.refetch();
                    void sellerQuery.refetch();
                  }}
                >
                  {t("common.tryAgain")}
                </Button>
              </section>
            ) : (
              <>
                <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="relative w-fit">
                      <SellerAvatar
                        src={profile.avatar}
                        alt={t("selling.profile.avatar")}
                        className="size-24 rounded-3xl object-cover"
                      />
                      <label className="absolute -bottom-2 -right-2 grid size-11 cursor-pointer place-items-center rounded-full border bg-white shadow focus-within:ring-2 focus-within:ring-brand-500">
                        <span className="sr-only">
                          {t("selling.profile.photo")}
                        </span>
                        <Camera className="size-4" />
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="sr-only"
                          disabled={avatarMutation.isPending}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) avatarMutation.mutate(file);
                            event.currentTarget.value = "";
                          }}
                        />
                      </label>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black">{seller.name}</h2>
                        {seller.verified && (
                          <BadgeCheck
                            className="size-5 text-brand-600"
                            aria-label={t("selling.profile.verified")}
                          />
                        )}
                      </div>
                      {locationLabel && (
                        <p className="mt-1 text-sm text-slate-500">
                          {locationLabel}
                        </p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        asChild
                      >
                        <Link href={`/seller/${seller.id}`}>
                          <Eye className="size-4" />
                          {t("selling.profile.preview")}
                        </Link>
                      </Button>
                    </div>
                  </div>
                  {avatarMutation.isError && (
                    <p className="mt-4 text-sm font-semibold text-rose-600">
                      {t("common.error")}
                    </p>
                  )}
                </section>

                <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="text-lg font-black">
                    {t("selling.profile.public")}
                  </h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label className="sm:col-span-2">
                      <span className="mb-1.5 block text-sm font-bold">
                        {t("selling.profile.displayName")}
                      </span>
                      <Input
                        value={form.displayName}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            displayName: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label>
                      <span className="mb-1.5 block text-sm font-bold">
                        {t("selling.profile.type")}
                      </span>
                      <select
                        className="h-11 w-full rounded-xl border bg-white px-3 text-sm"
                        value={form.sellerType}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            sellerType: event.target.value as SellerType,
                          }))
                        }
                      >
                        <option value="individual">
                          {t("selling.profile.individual")}
                        </option>
                        <option value="business">
                          {t("selling.profile.business")}
                        </option>
                      </select>
                    </label>
                    <label>
                      <span className="mb-1.5 block text-sm font-bold">
                        {t("selling.profile.phone")}
                      </span>
                      <Input
                        value={form.phone}
                        autoComplete="tel"
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            phone: event.target.value,
                          }))
                        }
                      />
                    </label>

                    <div className="sm:col-span-2">
                      <LocationFields
                        value={{
                          countryCode:
                            profileQuery.data?.location.countryCode ||
                            user?.countryCode ||
                            market.code,
                          state: form.stateName,
                          stateCode: form.stateCode,
                          city: form.city,
                          district: form.district,
                        }}
                        onChange={(location) =>
                          setForm((current) => ({
                            ...current,
                            stateName: location.state || location.stateCode,
                            stateCode: location.stateCode,
                            city: location.city,
                            district: location.district,
                          }))
                        }
                        labels={{
                          region: t("search.region"),
                          state: t("selling.profile.state"),
                          city: t("selling.profile.city"),
                          district: t("account.profile.district"),
                        }}
                        placeholders={{
                          city: t("selling.profile.city"),
                          district: t("account.profile.districtPlaceholder"),
                        }}
                        countryCode={
                          profileQuery.data?.location.countryCode ||
                          user?.countryCode ||
                          market.code
                        }
                      />
                    </div>

                    <label className="sm:col-span-2">
                      <span className="mb-1.5 block text-sm font-bold">
                        {t("selling.profile.about")}
                      </span>
                      <textarea
                        value={form.bio}
                        maxLength={240}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            bio: event.target.value,
                          }))
                        }
                        className="min-h-32 w-full rounded-xl border p-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                      />
                    </label>
                  </div>

                  {saved && (
                    <p
                      className="mt-4 rounded-xl bg-brand-50 p-3 text-sm font-semibold text-brand-800"
                      role="status"
                      aria-live="polite"
                    >
                      {t("selling.profile.saved")}
                    </p>
                  )}
                  {saveMutation.isError && (
                    <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                      {t("common.error")}
                    </p>
                  )}
                  <Button
                    className="mt-5 w-full sm:w-auto"
                    disabled={
                      saveMutation.isPending ||
                      !form.displayName.trim() ||
                      !form.city.trim()
                    }
                    loading={saveMutation.isPending}
                    onClick={() => saveMutation.mutate()}
                  >
                    {t("selling.profile.save")}
                  </Button>
                </section>
              </>
            )}
          </div>
        </div>
      </main>
    </MarketplaceShell>
  );
}
