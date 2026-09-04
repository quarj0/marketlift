"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LoaderCircle, LocateFixed } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  brazilLocations,
  brazilRegions,
  getBrazilState,
  type BrazilRegionCode,
} from "@/data/brazil-locations";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useCurrentLocation } from "@/hooks/use-current-location";
import { useLocale } from "@/providers/locale-provider";
import { useMarket } from "@/providers/market-provider";
import {
  locationService,
  type StateRow,
} from "@/services/location.service";

export type LocationFieldValue = {
  countryCode?: string;
  state?: string;
  stateCode: string;
  city: string;
  district: string;
  latitude?: number;
  longitude?: number;
  locationToken?: string;
};

type Props = {
  value: LocationFieldValue;
  onChange: (value: LocationFieldValue) => void;
  labels: {
    country?: string;
    region: string;
    state: string;
    city: string;
    district: string;
  };
  placeholders?: {
    state?: string;
    city?: string;
    district?: string;
  };
  errors?: Partial<Record<keyof LocationFieldValue, string>>;
  className?: string;
  showCountry?: boolean;
  showRegion?: boolean;
  showCurrentLocation?: boolean;
  countryCode?: string;
};

function SuggestionInput({
  value,
  onChange,
  onChoose,
  suggestions,
  placeholder,
  autoComplete,
  disabled,
  invalid,
  loading,
}: {
  value: string;
  onChange: (value: string) => void;
  onChoose: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  autoComplete: string;
  disabled?: boolean;
  invalid?: boolean;
  loading?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const visible =
    focused &&
    !disabled &&
    value.trim().length > 0 &&
    (loading || suggestions.length > 0);

  return (
    <div className="relative">
      <Input
        value={value}
        autoComplete={autoComplete}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={invalid}
        aria-autocomplete="list"
      />
      {visible && (
        <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
          {loading && suggestions.length === 0 ? (
            <div className="flex items-center gap-2 px-3 py-2.5 text-sm text-slate-500">
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              Searching…
            </div>
          ) : (
            suggestions.slice(0, 20).map((suggestion) => (
              <button
                type="button"
                key={suggestion}
                className="block min-h-10 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-800"
                onMouseDown={(event) => {
                  event.preventDefault();
                  onChoose(suggestion);
                  setFocused(false);
                }}
              >
                {suggestion}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function LocationFields({
  value,
  onChange,
  labels,
  placeholders,
  errors,
  className = "grid gap-4 sm:grid-cols-2",
  showCountry = true,
  showRegion = true,
  showCurrentLocation = true,
  countryCode,
}: Props) {
  const { t } = useLocale();
  const { market, enabledMarkets, setMarket } = useMarket();

  const country = (
    countryCode ||
    value.countryCode ||
    market.countryCode ||
    market.code
  ).toUpperCase();
  const activeMarket =
    enabledMarkets.find(
      (item) =>
        item.countryCode.toUpperCase() === country ||
        item.code.toUpperCase() === country,
    ) || market;

  const isBrazil = country === "BR";
  const { locate, locating, errorCode, clearError } =
    useCurrentLocation(country);
  const selectedState = isBrazil ? getBrazilState(value.stateCode) : undefined;
  const [regionDraft, setRegionDraft] = useState<BrazilRegionCode>("SE");

  const regionCode = selectedState?.regionCode ?? regionDraft;
  const debouncedState = useDebouncedValue(
    value.state || value.stateCode || "",
    250,
  );
  const debouncedCity = useDebouncedValue(value.city, 250);
  const debouncedDistrict = useDebouncedValue(value.district, 250);

  const brazilStates = isBrazil
    ? brazilLocations.filter((state) => state.regionCode === regionCode)
    : [];

  const stateSuggestionsQuery = useQuery({
    queryKey: ["location-states", country, debouncedState],
    queryFn: () =>
      locationService.getStateSuggestions(country, debouncedState, 40),
    enabled: !isBrazil && debouncedState.trim().length >= 1,
    staleTime: 24 * 60 * 60_000,
  });

  const citiesQuery = useQuery({
    queryKey: ["location-cities", country, value.stateCode, debouncedCity],
    queryFn: () =>
      locationService.getCities(country, value.stateCode, debouncedCity, 80),
    enabled: isBrazil
      ? Boolean(selectedState)
      : debouncedCity.trim().length >= 1,
    staleTime: 24 * 60 * 60_000,
  });

  const neighborhoodsQuery = useQuery({
    queryKey: [
      "location-neighborhoods",
      country,
      value.stateCode,
      value.city,
      debouncedDistrict,
    ],
    queryFn: () =>
      locationService.getNeighborhoods(
        country,
        value.stateCode,
        value.city,
        debouncedDistrict,
      ),
    enabled:
      value.city.trim().length >= 2 && debouncedDistrict.trim().length >= 1,
    staleTime: 5 * 60_000,
  });

  const cities = citiesQuery.data?.length
    ? citiesQuery.data
    : isBrazil
      ? [...(selectedState?.cities ?? [])].filter((city) =>
          city
            .toLocaleLowerCase("pt-BR")
            .includes(value.city.toLocaleLowerCase("pt-BR")),
        )
      : [];

  const stateSuggestions = useMemo(
    () => stateSuggestionsQuery.data ?? [],
    [stateSuggestionsQuery.data],
  );
  const stateNames = useMemo(
    () => stateSuggestions.map((state) => state.name),
    [stateSuggestions],
  );
  const neighborhoods = neighborhoodsQuery.data ?? [];

  function emit(patch: Partial<LocationFieldValue>) {
    onChange({
      countryCode: country,
      state: value.state || "",
      stateCode: value.stateCode || "",
      city: value.city || "",
      district: value.district || "",
      locationToken: value.locationToken,
      ...patch,
    });
  }

  function changeCountry(marketCode: string) {
    const next = enabledMarkets.find((item) => item.code === marketCode);
    if (!next) return;
    clearError();
    setMarket(next.code);
    setRegionDraft("SE");
    onChange({
      countryCode: next.countryCode,
      state: "",
      stateCode: "",
      city: "",
      district: "",
      latitude: undefined,
      longitude: undefined,
      locationToken: undefined,
    });
  }

  function updateBrazilState(stateCode: string) {
    clearError();
    const state = getBrazilState(stateCode);
    if (!state) {
      emit({
        state: "",
        stateCode: "",
        city: "",
        district: "",
        latitude: undefined,
        longitude: undefined,
      });
      return;
    }
    setRegionDraft(state.regionCode);
    emit({
      state: state.name,
      stateCode: state.code,
      city: "",
      district: "",
      latitude: undefined,
      longitude: undefined,
      locationToken: undefined,
    });
  }

  function chooseGenericState(name: string) {
    const state =
      stateSuggestions.find((item) => item.name === name) ||
      ({
        name,
        code: name,
      } satisfies StateRow);
    clearError();
    emit({
      state: state.name,
      stateCode: state.code || state.name,
      city: "",
      district: "",
      latitude: undefined,
      longitude: undefined,
      locationToken: undefined,
    });
  }

  async function chooseDistrict(district: string) {
    const provisional = {
      countryCode: country,
      state: value.state || "",
      stateCode: value.stateCode,
      city: value.city,
      district,
      latitude: undefined,
      longitude: undefined,
      locationToken: undefined,
    };
    onChange(provisional);

    try {
      const resolved = await locationService.resolveSelection(provisional);
      if (!resolved?.locationToken) return;
      onChange({
        countryCode: resolved.countryCode || country,
        state: resolved.state || provisional.state,
        stateCode: resolved.stateCode || provisional.stateCode,
        city: resolved.city || provisional.city,
        district: resolved.district || provisional.district,
        latitude: resolved.latitude,
        longitude: resolved.longitude,
        locationToken: resolved.locationToken,
      });
    } catch {
      // The page-level Continue action retries resolution and shows a useful
      // validation message if the provider cannot resolve this selection.
    }
  }

  async function chooseCurrentLocation() {
    const resolved = await locate();
    if (!resolved) return;
    if (isBrazil) {
      const state = getBrazilState(resolved.stateCode);
      if (state) setRegionDraft(state.regionCode);
    }
    emit({
      countryCode: country,
      state: resolved.state,
      stateCode: resolved.stateCode,
      city: resolved.city,
      district: resolved.district ?? "",
      latitude: resolved.latitude,
      longitude: resolved.longitude,
      locationToken: resolved.locationToken,
    });
  }

  const errorText =
    errorCode === "denied"
      ? t("location.denied")
      : errorCode === "unsupported"
        ? t("location.unavailable")
        : errorCode === "outside_market"
          ? `Your current location is outside ${activeMarket.countryName}.`
          : t("location.failed");

  return (
    <div className={className}>
      {showCountry && (
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold">
            {labels.country || "Country"}
          </span>
          <select
            value={activeMarket.code}
            onChange={(event) => changeCountry(event.target.value)}
            className="h-11 w-full rounded-xl border bg-white px-3 text-sm"
          >
            {enabledMarkets.map((item) => (
              <option key={item.code} value={item.code}>
                {item.countryName}
              </option>
            ))}
          </select>
        </label>
      )}

      {isBrazil && showRegion && (
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold">{labels.region}</span>
          <select
            value={regionCode}
            onChange={(event) => {
              const nextRegion = event.target.value as BrazilRegionCode;
              setRegionDraft(nextRegion);
              clearError();
              emit({
                state: "",
                stateCode: "",
                city: "",
                district: "",
                latitude: undefined,
                longitude: undefined,
              });
            }}
            className="h-11 w-full rounded-xl border bg-white px-3 text-sm"
          >
            {brazilRegions.map((region) => (
              <option key={region.code} value={region.code}>
                {region.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="block">
        <span className="mb-1.5 block text-sm font-bold">{labels.state}</span>
        {isBrazil ? (
          <select
            value={selectedState?.code ?? ""}
            onChange={(event) => updateBrazilState(event.target.value)}
            aria-invalid={Boolean(errors?.stateCode)}
            className="h-11 w-full rounded-xl border bg-white px-3 text-sm"
          >
            <option value="">Select {labels.state.toLowerCase()}</option>
            {brazilStates.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name} ({state.code})
              </option>
            ))}
          </select>
        ) : (
          <SuggestionInput
            value={value.state || value.stateCode}
            suggestions={stateNames}
            loading={stateSuggestionsQuery.isFetching}
            autoComplete="address-level1"
            onChange={(state) =>
              emit({
                state,
                stateCode: state,
                city: "",
                district: "",
                latitude: undefined,
                longitude: undefined,
              })
            }
            onChoose={chooseGenericState}
            placeholder={placeholders?.state || labels.state}
            invalid={Boolean(errors?.stateCode)}
          />
        )}
        {errors?.stateCode && (
          <span className="mt-1 block text-sm text-red-600">
            {errors.stateCode}
          </span>
        )}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-bold">{labels.city}</span>
        <SuggestionInput
          value={value.city}
          suggestions={cities}
          loading={citiesQuery.isFetching}
          autoComplete="address-level2"
          disabled={isBrazil && !selectedState}
          onChange={(city) =>
            emit({
              city,
              district: "",
              latitude: undefined,
              longitude: undefined,
              locationToken: undefined,
            })
          }
          onChoose={(city) =>
            emit({
              city,
              district: "",
              latitude: undefined,
              longitude: undefined,
              locationToken: undefined,
            })
          }
          placeholder={placeholders?.city || `Select ${labels.city.toLowerCase()}`}
          invalid={Boolean(errors?.city)}
        />
        {errors?.city && (
          <span className="mt-1 block text-sm text-red-600">{errors.city}</span>
        )}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-bold">{labels.district}</span>
        <SuggestionInput
          value={value.district}
          suggestions={neighborhoods}
          loading={neighborhoodsQuery.isFetching}
          autoComplete="address-level3"
          disabled={!value.city.trim()}
          onChange={(district) =>
            emit({
              district,
              latitude: undefined,
              longitude: undefined,
              locationToken: undefined,
            })
          }
          onChoose={(district) => void chooseDistrict(district)}
          placeholder={
            placeholders?.district || `Select ${labels.district.toLowerCase()}`
          }
          invalid={Boolean(errors?.district)}
        />
        {errors?.district && (
          <span className="mt-1 block text-sm text-red-600">
            {errors.district}
          </span>
        )}
      </label>

      {showCurrentLocation && (
        <div className="sm:col-span-2 lg:col-span-full">
          <Button
            type="button"
            variant="outline"
            onClick={chooseCurrentLocation}
            disabled={locating}
          >
            {locating ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <LocateFixed className="size-4" aria-hidden="true" />
            )}
            {locating ? t("location.locating") : t("location.useMine")}
          </Button>
          {errorCode && (
            <p role="alert" className="mt-2 text-sm font-medium text-amber-800">
              {errorText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
