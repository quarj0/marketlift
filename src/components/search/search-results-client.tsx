"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Grid2X2, List, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { listingService } from "@/services/listing.service";
import { brazilLocations, brazilRegions } from "@/data/brazil-locations";
import { locationService } from "@/services/location.service";
import { categoryService } from "@/services/category.service";
import { ListingCard } from "@/components/listings/listing-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/providers/locale-provider";
import { useMarket } from "@/providers/market-provider";
import type { ListingCondition, SearchFilters, SellerType } from "@/types";

const toNum = (value: string | null) =>
  value && !Number.isNaN(Number(value)) ? Number(value) : undefined;

function useFilters(): SearchFilters {
  const params = useSearchParams();
  const { market } = useMarket();
  const legacyLocation = params.get("location") || "";
  const legacyMatch = legacyLocation.match(
    /^(.*?)(?:,|\s)\s*([A-Za-z]{2})\s*$/,
  );
  const legacyState =
    legacyMatch && market.code === "BR"
      ? brazilLocations.find(
          (state) => state.code === legacyMatch[2].toUpperCase(),
        )
      : undefined;
  const state = params.get("state") || legacyState?.code || "";
  const city =
    params.get("city") || (legacyState ? legacyMatch?.[1].trim() || "" : "");
  const stateRow =
    market.code === "BR"
      ? brazilLocations.find((item) => item.code === state)
      : undefined;

  return {
    countryCode: market.code,
    q: params.get("q") || "",
    category: params.get("category") || "",
    region: params.get("region") || stateRow?.regionCode || "",
    state,
    city,
    district: params.get("district") || "",
    latitude: toNum(params.get("latitude") || params.get("lat")),
    longitude: toNum(params.get("longitude") || params.get("lng")),
    radiusKm: toNum(params.get("radiusKm") || params.get("radius_km")),
    minPrice: toNum(params.get("minPrice")),
    maxPrice: toNum(params.get("maxPrice")),
    condition: (params.get("condition") || "") as ListingCondition | "",
    sellerType: (params.get("sellerType") || "") as SellerType | "",
    verifiedOnly: params.get("verified") === "1",
    dateListed: (params.get("date") || "") as SearchFilters["dateListed"],
    sort: (params.get("sort") || "relevant") as SearchFilters["sort"],
  };
}

export function SearchResultsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useFilters();
  const { t, categoryName, locale } = useLocale();
  const { market } = useMarket();
  const isBrazil = market.code === "BR";
  const [mobileFilters, setMobileFilters] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const cityFilterKey = `${filters.state}:${filters.city}`;
  const districtFilterKey = `${filters.state}:${filters.city}:${filters.district}`;
  const [cityDraftState, setCityDraftState] = useState<{
    key: string;
    value: string;
  } | null>(null);
  const [districtDraftState, setDistrictDraftState] = useState<{
    key: string;
    value: string;
  } | null>(null);
  const cityDraft =
    cityDraftState?.key === cityFilterKey
      ? cityDraftState.value
      : filters.city || "";
  const districtDraft =
    districtDraftState?.key === districtFilterKey
      ? districtDraftState.value
      : filters.district || "";
  const setCityDraft = (value: string) =>
    setCityDraftState({ key: cityFilterKey, value });
  const setDistrictDraft = (value: string) =>
    setDistrictDraftState({ key: districtFilterKey, value });
  const debouncedCityDraft = useDebouncedValue(cityDraft, 250);
  const debouncedDistrictDraft = useDebouncedValue(districtDraft, 250);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getCategories,
    staleTime: 5 * 60_000,
  });
  const categories = categoriesQuery.data ?? [];

  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["listings", market.code, filters],
    queryFn: () => listingService.getListings(filters),
  });

  const selectedState = isBrazil
    ? brazilLocations.find((state) => state.code === filters.state)
    : undefined;
  const selectedRegionCode = filters.region || selectedState?.regionCode || "";
  const selectedRegion = isBrazil
    ? brazilRegions.find((region) => region.code === selectedRegionCode)
    : undefined;
  const states = isBrazil
    ? selectedRegionCode
      ? brazilLocations.filter(
          (state) => state.regionCode === selectedRegionCode,
        )
      : brazilLocations
    : [];
  const citiesQuery = useQuery({
    queryKey: [
      "location-cities",
      market.code,
      filters.state,
      debouncedCityDraft,
    ],
    queryFn: () =>
      locationService.getCities(
        market.code,
        filters.state || "",
        debouncedCityDraft,
        40,
      ),
    enabled: isBrazil
      ? Boolean(filters.state)
      : debouncedCityDraft.trim().length >= 2,
    staleTime: 24 * 60 * 60_000,
  });
  const neighborhoodsQuery = useQuery({
    queryKey: [
      "location-neighborhoods",
      market.code,
      filters.state,
      filters.city,
      debouncedDistrictDraft,
    ],
    queryFn: () =>
      locationService.getNeighborhoods(
        market.code,
        filters.state || "",
        filters.city || "",
        debouncedDistrictDraft,
      ),
    enabled: Boolean(filters.city),
    staleTime: 5 * 60_000,
  });
  const cities = citiesQuery.data?.length
    ? citiesQuery.data
    : isBrazil
      ? [...(selectedState?.cities ?? [])].filter((city) =>
          city
            .toLocaleLowerCase("pt-BR")
            .includes(cityDraft.toLocaleLowerCase("pt-BR")),
        )
      : [];
  const neighborhoods = neighborhoodsQuery.data ?? [];

  function update(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams.toString());
    const changesManualLocation = [
      "region",
      "state",
      "city",
      "district",
      "location",
    ].some((key) => Object.prototype.hasOwnProperty.call(patch, key));

    if (changesManualLocation) {
      next.delete("latitude");
      next.delete("longitude");
      next.delete("lat");
      next.delete("lng");
      next.delete("radiusKm");
      next.delete("radius_km");
      if (next.get("sort") === "distance") next.set("sort", "relevant");
    }

    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  const clear = () => router.replace(pathname);
  const hasCoordinates =
    Number.isFinite(filters.latitude) && Number.isFinite(filters.longitude);
  const locationLabel =
    filters.city ||
    selectedState?.name ||
    selectedRegion?.name ||
    market.countryName;
  const count = data.length.toLocaleString(
    locale === "pt-BR" ? "pt-BR" : "en-US",
  );
  const countText = t(data.length === 1 ? "search.countOne" : "search.count", {
    count,
    location: locationLabel,
  });

  const panel = (
    <div className="space-y-5">
      <div>
        <label
          htmlFor="search-filter-keyword"
          className="mb-2 block text-sm font-semibold"
        >
          {t("search.keyword")}
        </label>
        <Input
          id="search-filter-keyword"
          defaultValue={filters.q}
          key={`q-${filters.q}`}
          placeholder={t("search.what")}
          onKeyDown={(event) => {
            if (event.key === "Enter") update({ q: event.currentTarget.value });
          }}
        />
      </div>
      <div>
        <label
          htmlFor="search-filter-category"
          className="mb-2 block text-sm font-semibold"
        >
          {t("search.category")}
        </label>
        <select
          id="search-filter-category"
          value={filters.category}
          onChange={(event) => update({ category: event.target.value })}
          className="h-11 w-full rounded-xl border bg-white px-3 text-sm"
        >
          <option value="">{t("search.allCategories")}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {categoryName(category.id, category.name)}
            </option>
          ))}
        </select>
      </div>
      {isBrazil ? (
        <>
          <div>
            <label
              htmlFor="search-filter-region"
              className="mb-2 block text-sm font-semibold"
            >
              {t("search.region")}
            </label>
            <select
              id="search-filter-region"
              value={selectedRegionCode}
              onChange={(event) => {
                setCityDraft("");
                setDistrictDraft("");
                update({
                  region: event.target.value,
                  state: undefined,
                  city: undefined,
                  district: undefined,
                  location: undefined,
                });
              }}
              className="h-11 w-full rounded-xl border bg-white px-3 text-sm"
            >
              <option value="">{t("search.all")}</option>
              {brazilRegions.map((region) => (
                <option key={region.code} value={region.code}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                htmlFor="search-filter-state"
                className="mb-2 block text-sm font-semibold"
              >
                {t("search.state")}
              </label>
              <select
                id="search-filter-state"
                value={filters.state}
                onChange={(event) => {
                  const state = brazilLocations.find(
                    (item) => item.code === event.target.value,
                  );
                  setCityDraft("");
                  setDistrictDraft("");
                  update({
                    state: event.target.value,
                    region: state?.regionCode || filters.region || undefined,
                    city: undefined,
                    district: undefined,
                    location: undefined,
                  });
                }}
                className="h-11 w-full rounded-xl border bg-white px-3 text-sm"
              >
                <option value="">{t("search.all")}</option>
                {states.map((state) => (
                  <option key={state.code} value={state.code}>
                    {state.name} ({state.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="search-filter-city"
                className="mb-2 block text-sm font-semibold"
              >
                {t("search.city")}
              </label>
              <Input
                id="search-filter-city"
                disabled={!filters.state}
                value={cityDraft}
                list="search-city-suggestions"
                placeholder={
                  filters.state ? t("search.allCities") : t("search.state")
                }
                onChange={(event) => setCityDraft(event.target.value)}
                onBlur={() => {
                  setDistrictDraft("");
                  update({
                    city: cityDraft.trim() || undefined,
                    district: undefined,
                    location: undefined,
                  });
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    setDistrictDraft("");
                    update({
                      city: cityDraft.trim() || undefined,
                      district: undefined,
                      location: undefined,
                    });
                  }
                }}
              />
              <datalist id="search-city-suggestions">
                {cities.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label
              htmlFor="search-filter-state"
              className="mb-2 block text-sm font-semibold"
            >
              State / region
            </label>
            <Input
              id="search-filter-state"
              value={filters.state}
              placeholder="State or region"
              onChange={(event) =>
                update({ state: event.target.value || undefined })
              }
            />
          </div>
          <div>
            <label
              htmlFor="search-filter-city"
              className="mb-2 block text-sm font-semibold"
            >
              {t("search.city")}
            </label>
            <Input
              id="search-filter-city"
              value={cityDraft}
              list="search-city-suggestions"
              placeholder={`City in ${market.countryName}`}
              onChange={(event) => setCityDraft(event.target.value)}
              onBlur={() => {
                setDistrictDraft("");
                update({
                  city: cityDraft.trim() || undefined,
                  district: undefined,
                });
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  update({ city: cityDraft.trim() || undefined });
                }
              }}
            />
            <datalist id="search-city-suggestions">
              {cities.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
          </div>
        </div>
      )}
      <div>
        <label
          htmlFor="search-filter-neighborhood"
          className="mb-2 block text-sm font-semibold"
        >
          {t("search.neighborhood")}
        </label>
        <Input
          id="search-filter-neighborhood"
          disabled={!filters.city}
          value={districtDraft}
          list="search-neighborhood-suggestions"
          placeholder={t("selling.new.districtPlaceholder")}
          onChange={(event) => setDistrictDraft(event.target.value)}
          onBlur={() => update({ district: districtDraft.trim() || undefined })}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              update({ district: districtDraft.trim() || undefined });
            }
          }}
        />
        <datalist id="search-neighborhood-suggestions">
          {neighborhoods.map((district) => (
            <option key={district} value={district} />
          ))}
        </datalist>
      </div>
      <fieldset>
        <legend className="mb-2 block text-sm font-semibold">
          {t("search.priceRange")}
        </legend>
        <div className="grid grid-cols-2 gap-2">
          <Input
            aria-label={t("search.min")}
            inputMode="numeric"
            defaultValue={filters.minPrice}
            key={`min-${filters.minPrice}`}
            placeholder={t("search.min")}
            onBlur={(event) => update({ minPrice: event.target.value })}
          />
          <Input
            aria-label={t("search.max")}
            inputMode="numeric"
            defaultValue={filters.maxPrice}
            key={`max-${filters.maxPrice}`}
            placeholder={t("search.max")}
            onBlur={(event) => update({ maxPrice: event.target.value })}
          />
        </div>
      </fieldset>
      <div>
        <label
          htmlFor="search-filter-condition"
          className="mb-2 block text-sm font-semibold"
        >
          {t("search.condition")}
        </label>
        <select
          id="search-filter-condition"
          value={filters.condition}
          onChange={(event) => update({ condition: event.target.value })}
          className="h-11 w-full rounded-xl border bg-white px-3 text-sm"
        >
          <option value="">{t("search.anyCondition")}</option>
          <option value="New">{t("search.condition.new")}</option>
          <option value="Like new">{t("search.condition.likeNew")}</option>
          <option value="Used">{t("search.condition.used")}</option>
        </select>
      </div>
      <div>
        <label
          htmlFor="search-filter-seller"
          className="mb-2 block text-sm font-semibold"
        >
          {t("search.sellerType")}
        </label>
        <select
          id="search-filter-seller"
          value={filters.sellerType}
          onChange={(event) => update({ sellerType: event.target.value })}
          className="h-11 w-full rounded-xl border bg-white px-3 text-sm"
        >
          <option value="">{t("search.anySeller")}</option>
          <option value="individual">{t("search.individual")}</option>
          <option value="business">{t("search.business")}</option>
        </select>
      </div>
      <div>
        <label
          htmlFor="search-filter-date"
          className="mb-2 block text-sm font-semibold"
        >
          {t("search.dateListed")}
        </label>
        <select
          id="search-filter-date"
          value={filters.dateListed}
          onChange={(event) => update({ date: event.target.value })}
          className="h-11 w-full rounded-xl border bg-white px-3 text-sm"
        >
          <option value="">{t("search.anyTime")}</option>
          <option value="today">{t("search.today")}</option>
          <option value="week">{t("search.last7")}</option>
          <option value="month">{t("search.last30")}</option>
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={!!filters.verifiedOnly}
          onChange={(event) =>
            update({ verified: event.target.checked ? "1" : undefined })
          }
          className="size-4 accent-brand-600"
        />
        {t("search.verifiedOnly")}
      </label>
      <Button variant="outline" className="w-full" onClick={clear}>
        <RotateCcw className="size-4" />
        {t("search.reset")}
      </Button>
    </div>
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            {t("search.resultsTitle")}
          </h1>
          <p
            className="mt-1 text-sm text-slate-500"
            role="status"
            aria-live="polite"
          >
            {isLoading ? t("search.searching") : countText}
          </p>
        </div>
        <Button
          variant="outline"
          className="lg:hidden"
          onClick={() => setMobileFilters(true)}
        >
          <SlidersHorizontal className="size-4" />
          {t("search.filters")}
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden self-start rounded-2xl border bg-white p-5 lg:sticky lg:top-32 lg:block">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-bold">{t("search.filters")}</h2>
            <button
              type="button"
              onClick={clear}
              className="inline-flex min-h-11 items-center text-xs font-semibold text-brand-700"
            >
              {t("search.clear")}
            </button>
          </div>
          {panel}
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              {isLoading ? t("common.loading") : t("search.showing", { count })}
            </p>
            <div className="flex items-center gap-2">
              <div className="hidden rounded-xl border p-1 sm:flex">
                <button
                  type="button"
                  aria-pressed={view === "grid"}
                  onClick={() => setView("grid")}
                  className={`grid size-11 place-items-center rounded-lg ${view === "grid" ? "bg-slate-100" : ""}`}
                  aria-label={t("search.grid")}
                >
                  <Grid2X2 className="size-4" />
                </button>
                <button
                  type="button"
                  aria-pressed={view === "list"}
                  onClick={() => setView("list")}
                  className={`grid size-11 place-items-center rounded-lg ${view === "list" ? "bg-slate-100" : ""}`}
                  aria-label={t("search.list")}
                >
                  <List className="size-4" />
                </button>
              </div>
              <select
                aria-label={t("search.sortLabel")}
                value={filters.sort}
                onChange={(event) => update({ sort: event.target.value })}
                className="h-11 rounded-xl border bg-white px-3 text-sm"
              >
                <option value="relevant">{t("search.sort.relevant")}</option>
                {hasCoordinates && (
                  <option value="distance">{t("search.sort.distance")}</option>
                )}
                <option value="newest">{t("search.sort.newest")}</option>
                <option value="price_asc">{t("search.sort.lowest")}</option>
                <option value="price_desc">{t("search.sort.highest")}</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border bg-white"
                >
                  <div className="aspect-4/3 animate-pulse bg-slate-100" />
                  <div className="space-y-3 p-4">
                    <div className="h-6 w-1/3 animate-pulse rounded bg-slate-100" />
                    <div className="h-4 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-2xl border bg-white p-10 text-center">
              <h2 className="text-xl font-bold">{t("search.loadError")}</h2>
              <p className="mt-2 text-slate-500">{t("search.loadErrorBody")}</p>
              <Button className="mt-5" onClick={() => refetch()}>
                {t("common.retry")}
              </Button>
            </div>
          ) : data.length ? (
            <div
              className={
                view === "grid"
                  ? "grid grid-cols-2 gap-3 md:grid-cols-3"
                  : "grid gap-3"
              }
            >
              {data.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  variant={view}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border bg-white p-10 text-center">
              <h2 className="text-xl font-bold">{t("search.noResults")}</h2>
              <p className="mt-2 text-slate-500">{t("search.noResultsBody")}</p>
              <Button variant="outline" className="mt-5" onClick={clear}>
                {t("search.clearFilters")}
              </Button>
            </div>
          )}
        </section>
      </div>

      <Dialog open={mobileFilters} onOpenChange={setMobileFilters}>
        <DialogContent
          showCloseButton={false}
          className="top-auto bottom-0 left-0 max-h-[88dvh] w-full max-w-none translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-b-none rounded-t-3xl p-5 pb-[max(2rem,env(safe-area-inset-bottom))] lg:hidden"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-lg font-bold">
                {t("search.filters")}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {t("search.refine")}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileFilters(false)}
              aria-label={t("search.closeFilters")}
            >
              <X className="size-5" aria-hidden="true" />
            </Button>
          </div>
          {panel}
          <Button
            className="mt-5 w-full"
            onClick={() => setMobileFilters(false)}
          >
            {t("search.showResults", { count })}
          </Button>
        </DialogContent>
      </Dialog>
    </main>
  );
}
