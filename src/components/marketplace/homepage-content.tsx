"use client";

import Link from "next/link";
import {
  BadgeCheck,
  ChevronRight,
  Flag,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { CategoryArtwork } from "@/components/categories/category-visual";
import { ListingCard } from "@/components/listings/listing-card";
import { SearchBar } from "@/components/search/search-bar";
import { SellerCard } from "@/components/seller/seller-card";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/providers/locale-provider";
import { useMarketplaceLocation } from "@/providers/marketplace-location-provider";
import { useMarket } from "@/providers/market-provider";
import { listingService } from "@/services/listing.service";
import { marketplaceService } from "@/services/marketplace.service";
import type { Category, Listing } from "@/types";

function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  href?: string;
  action: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-700">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
          {title}
        </h2>

        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            {description}
          </p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="hidden shrink-0 items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-800 sm:flex"
        >
          {action}
          <ChevronRight className="size-4" />
        </Link>
      )}
    </div>
  );
}

function ListingSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="aspect-4/3 animate-pulse bg-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-6 w-2/5 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}

function SellerSkeleton() {
  return (
    <div className="h-44 animate-pulse rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex gap-4">
        <div className="size-14 rounded-full bg-slate-200" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-1/2 rounded bg-slate-200" />
          <div className="h-4 w-1/3 rounded bg-slate-100" />
        </div>
      </div>
      <div className="mt-6 h-10 rounded-xl bg-slate-100" />
    </div>
  );
}

function ListingSection({
  listings,
  loading,
  emptyMessage,
}: {
  listings?: Listing[];
  loading: boolean;
  emptyMessage: string;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <ListingSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!listings?.length) {
    return (
      <div className="rounded-2xl border border-dashed bg-white px-6 py-12 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}

function ErrorCard({ onRetry }: { onRetry: () => void }) {
  const { t } = useLocale();

  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6">
      <p className="font-bold text-rose-900">{t("home.sectionError")}</p>

      <p className="mt-1 text-sm text-rose-700">{t("home.sectionErrorBody")}</p>

      <Button
        type="button"
        variant="outline"
        className="mt-4"
        onClick={onRetry}
      >
        {t("common.tryAgain")}
      </Button>
    </div>
  );
}

function CategoryGrid({
  categories,
  loading,
}: {
  categories?: Category[];
  loading: boolean;
}) {
  const { categoryName } = useLocale();

  if (loading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
        {Array.from({ length: 13 }).map((_, index) => (
          <div
            key={index}
            className="min-h-28 animate-pulse rounded-2xl border bg-white"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
      {categories?.map((category) => {
        return (
          <Link
            key={category.id}
            href={`/category/${category.id}`}
            className="group min-w-0 overflow-hidden rounded-2xl border bg-white text-center shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <div className="h-24 overflow-hidden transition duration-300 group-hover:scale-105 sm:h-28">
              <CategoryArtwork category={category} iconClassName="size-11 sm:size-12" />
            </div>

            <div className="p-3">
              <span className="line-clamp-2 text-sm font-bold leading-5 text-slate-800">
                {categoryName(category.id, category.name)}
              </span>
              {category.subcategories?.length ? (
                <span className="mt-1 hidden text-[10px] leading-4 text-slate-500 2xl:line-clamp-1">
                  {category.subcategories
                    .slice(0, 3)
                    .map((sub) => categoryName(sub.id, sub.name))
                    .join(" · ")}
                </span>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function HomepageContent({
  initialCategories = [],
}: {
  initialCategories?: Category[];
}) {
  const { t } = useLocale();
  const { market } = useMarket();
  const { location } = useMarketplaceLocation();

  const categoriesQuery = useQuery({
    // Same key as CategoryNav so React Query shares/deduplicates this request.
    queryKey: ["categories"],
    queryFn: marketplaceService.getCategories,
    initialData: initialCategories.length ? initialCategories : undefined,
    staleTime: 5 * 60_000,
  });

  const homeFeedQuery = useQuery({
    queryKey: ["marketplace", "home-feed", market.code],
    queryFn: () => marketplaceService.getHomeFeed(market.code),
    staleTime: 30_000,
  });

  const nearbyQuery = useQuery({
    queryKey: [
      "listings",
      "nearby",
      market.code,
      location.stateCode,
      location.city,
      location.district ?? "",
      location.latitude ?? null,
      location.longitude ?? null,
    ],
    queryFn: () => listingService.getNearby(location, 4),
  });

  const sectionError =
    nearbyQuery.isError ||
    homeFeedQuery.isError ||
    categoriesQuery.isError;

  return (
    <main className="flex flex-col overflow-hidden">
      <section className="relative isolate overflow-hidden bg-ink-950 text-white">
        <div className="absolute inset-0 -z-10 opacity-25" aria-hidden="true">
          <div className="absolute -right-24 top-8 size-80 rounded-full bg-cyan-400 blur-3xl" />
          <div className="absolute -left-20 bottom-0 size-72 rounded-full bg-lift-400 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_.85fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-bold backdrop-blur">
                <ShoppingBag className="size-4" />
                {t("home.localBadge")}
              </span>

              <h1 className="mt-5 max-w-4xl text-3xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
                {t("home.heroTitle")}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-brand-50 sm:text-lg">
                {t("home.heroDescription")}
              </p>

              <div className="mt-8 max-w-5xl">
                <SearchBar />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-brand-100">
                <span className="font-semibold text-white">
                  {t("home.popular")}
                </span>

                <Link className="hover:text-white" href="/search?q=iPhone+15">
                  iPhone 15
                </Link>

                <Link className="hover:text-white" href="/search?q=Honda+Civic">
                  Honda Civic
                </Link>

                <Link
                  className="hover:text-white"
                  href="/category/property"
                >
                  {t("category.properties")}
                </Link>

                <Link className="hover:text-white" href="/search?q=Samsung+S24">
                  Samsung S24
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 rounded-2xl bg-white p-5 text-slate-950">
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-700">
                      {t("home.snapshot")}
                    </p>

                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-2xl font-black">
                          {categoriesQuery.data?.length ?? 0}
                        </p>
                        <p className="text-xs text-slate-500">
                          {t("home.categoriesCount")}
                        </p>
                      </div>

                      <div>
                        <p className="text-2xl font-black">9</p>
                        <p className="text-xs text-slate-500">
                          {t("home.regionsCount")}
                        </p>
                      </div>

                      <div>
                        <p className="text-2xl font-black">24/7</p>
                        <p className="text-xs text-slate-500">
                          {t("home.browsing")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-ink-900/90 p-4">
                    <ShieldCheck className="size-6 text-cyan-300" />
                    <p className="mt-3 font-bold">
                      {t("home.sellerVerification")}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-300">
                      {t("home.sellerVerificationBody")}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-ink-900/90 p-4">
                    <MapPin className="size-6 text-cyan-300" />
                    <p className="mt-3 font-bold">{t("home.browseNearby")}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-300">
                      {t("home.browseNearbyBody")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-0 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            [t("home.signalVerified"), ShieldCheck],
            [t("home.signalLocation"), MapPin],
            [t("home.signalReporting"), Flag],
            [t("home.signalCommerce"), Users],
          ].map(([label, Icon], index) => {
            const SignalIcon = Icon as typeof ShieldCheck;

            return (
              <div
                key={String(label)}
                className={`flex items-center gap-3 py-4 text-sm font-semibold text-slate-700 ${
                  index % 2 === 0 ? "pr-3" : "pl-3"
                } md:px-4`}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <SignalIcon className="size-4" />
                </span>
                {String(label)}
              </div>
            );
          })}
        </div>
      </section>

      <section className="order-first mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:order-none lg:px-8 lg:py-14">
        <SectionHeading
          eyebrow={t("home.explore")}
          title={t("home.browseCategories")}
          description={t("home.browseCategoriesBody")}
          href="/search"
          action={t("common.viewAll")}
        />

        {categoriesQuery.isError ? (
          <ErrorCard onRetry={() => categoriesQuery.refetch()} />
        ) : (
          <CategoryGrid
            categories={categoriesQuery.data}
            loading={categoriesQuery.isLoading}
          />
        )}
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <SectionHeading
          eyebrow={`${location.city}, ${location.stateCode}`}
          title={t("home.nearbyTitle")}
          description={t("home.nearbyBody")}
          href={`/search?${new URLSearchParams({
            state: location.stateCode,
            city: location.city,
            ...(location.district ? { district: location.district } : {}),
            ...(Number.isFinite(location.latitude) &&
            Number.isFinite(location.longitude)
              ? {
                  latitude: String(location.latitude),
                  longitude: String(location.longitude),
                  radiusKm: "25",
                  sort: "distance",
                }
              : {}),
          }).toString()}`}
          action={t("common.viewAll")}
        />

        {nearbyQuery.isError ? (
          <ErrorCard onRetry={() => nearbyQuery.refetch()} />
        ) : (
          <ListingSection
            listings={nearbyQuery.data}
            loading={nearbyQuery.isLoading}
            emptyMessage={t("home.noNearby")}
          />
        )}
      </section>

      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={t("home.premium")}
            title={t("home.featured")}
            description={t("home.featuredBody")}
            href="/search?featured=true"
            action={t("home.seeFeatured")}
          />

          {homeFeedQuery.isError ? (
            <ErrorCard onRetry={() => homeFeedQuery.refetch()} />
          ) : (
            <ListingSection
              listings={homeFeedQuery.data?.featuredListings}
              loading={homeFeedQuery.isLoading}
              emptyMessage={t("home.noFeatured")}
            />
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <SectionHeading
          eyebrow={t("home.justIn")}
          title={t("home.recent")}
          description={t("home.recentBody")}
          href="/search?sort=newest"
          action={t("home.browseNewest")}
        />

        {homeFeedQuery.isError ? (
          <ErrorCard onRetry={() => homeFeedQuery.refetch()} />
        ) : (
          <ListingSection
            listings={homeFeedQuery.data?.recentListings}
            loading={homeFeedQuery.isLoading}
            emptyMessage={t("home.noRecent")}
          />
        )}
      </section>

      {(homeFeedQuery.data?.verifiedSellers.length ?? 0) > 0 && (
        <section className="border-y bg-slate-100/70 py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t("home.trusted")}
              title={t("home.verifiedSellers")}
              description={t("home.verifiedSellersBody")}
              href="/search?verifiedOnly=true"
              action={t("home.viewListings")}
            />

            {homeFeedQuery.isError ? (
              <ErrorCard onRetry={() => homeFeedQuery.refetch()} />
            ) : homeFeedQuery.isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <SellerSkeleton key={index} />
                ))}
              </div>
            ) : homeFeedQuery.data?.verifiedSellers.length ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {homeFeedQuery.data.verifiedSellers.map((seller) => (
                  <SellerCard key={seller.id} seller={seller} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed bg-white p-10 text-center text-sm text-slate-500">
                {t("home.noVerified")}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="bg-ink-950 py-14 text-white lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:px-8">
          <div className="self-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-300">
              {t("home.tradeConfidence")}
            </p>

            <h2 className="mt-3 max-w-xl text-3xl font-black tracking-tight sm:text-4xl">
              {t("home.safetyTitle")}
            </h2>

            <p className="mt-4 max-w-xl leading-7 text-slate-300">
              {t("home.safetyBody")}
            </p>

            <Button
              variant="outline"
              className="mt-6 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href="/safety">{t("home.safetyGuide")}</Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [
                UserCheck,
                t("home.safetyVerified"),
                t("home.safetyVerifiedBody"),
              ],
              [
                ShieldCheck,
                t("home.safetyProfiles"),
                t("home.safetyProfilesBody"),
              ],
              [Flag, t("home.safetyReporting"), t("home.safetyReportingBody")],
              [
                BadgeCheck,
                t("home.safetyModeration"),
                t("home.safetyModerationBody"),
              ],
            ].map(([Icon, title, body]) => {
              const SafetyIcon = Icon as typeof ShieldCheck;

              return (
                <div
                  key={String(title)}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-brand-400/10 text-brand-300">
                    <SafetyIcon className="size-5" />
                  </span>

                  <h3 className="mt-4 font-bold">{String(title)}</h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {String(body)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="relative overflow-hidden rounded-[2rem] border border-brand-100 bg-linear-to-br from-brand-50 via-white to-lift-50 p-7 sm:p-10 lg:p-12">
          <div
            className="absolute -right-14 -top-16 size-56 rounded-full bg-lift-200/70 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-brand-700 shadow-sm">
                <Zap className="size-3.5" />
                {t("home.startSelling")}
              </span>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                {t("home.sellTitle")}
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-600">
                {t("home.sellBody")}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-lift-500 font-extrabold text-ink-950 hover:bg-lift-400"
                  asChild
                >
                  <Link href="/selling/listings/new">
                    {t("home.postListing")}
                  </Link>
                </Button>

                <Button size="lg" variant="outline" asChild>
                  <Link href="/selling/start">{t("home.exploreSelling")}</Link>
                </Button>
              </div>
            </div>

            <div className="hidden min-w-64 rounded-2xl border bg-white p-5 shadow-sm lg:block">
              <p className="text-sm font-bold text-slate-950">
                {t("home.sellerJourney")}
              </p>

              <div className="mt-4 space-y-4 text-sm text-slate-600">
                {[
                  ["1", t("home.journey1")],
                  ["2", t("home.journey2")],
                  ["3", t("home.journey3")],
                ].map(([number, text]) => (
                  <div key={number} className="flex items-center gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 font-black text-brand-700">
                      {number}
                    </span>
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {sectionError && (
        <div className="sr-only" role="status">
          {t("home.sectionError")}
        </div>
      )}
    </main>
  );
}
