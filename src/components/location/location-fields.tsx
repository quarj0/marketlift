'use client';

import { useId, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LoaderCircle, LocateFixed, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  brazilLocations,
  brazilRegions,
  getBrazilState,
  type BrazilRegionCode,
} from '@/data/brazil-locations';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useCurrentLocation } from '@/hooks/use-current-location';
import { useLocale } from '@/providers/locale-provider';
import { useMarket } from '@/providers/market-provider';
import { locationService } from '@/services/location.service';

export type LocationFieldValue = {
  countryCode?: string;
  state?: string;
  stateCode: string;
  city: string;
  district: string;
  latitude?: number;
  longitude?: number;
};

type Props = {
  value: LocationFieldValue;
  onChange: (value: LocationFieldValue) => void;
  labels: {
    region: string;
    state: string;
    city: string;
    district: string;
  };
  placeholders?: {
    city?: string;
    district?: string;
  };
  errors?: Partial<Record<keyof LocationFieldValue, string>>;
  className?: string;
  showRegion?: boolean;
  showCurrentLocation?: boolean;
  countryCode?: string;
};

export function LocationFields({
  value,
  onChange,
  labels,
  placeholders,
  errors,
  className = 'grid gap-4 sm:grid-cols-2',
  showRegion = true,
  showCurrentLocation = true,
  countryCode,
}: Props) {
  const { t } = useLocale();
  const { market } = useMarket();
  const country = (countryCode || value.countryCode || market.code).toUpperCase();
  const isBrazil = country === 'BR';
  const { locate, locating, errorCode, clearError } = useCurrentLocation(country);
  const uid = useId().replace(/:/g, '');
  const selectedState = isBrazil ? getBrazilState(value.stateCode) : undefined;
  const [regionDraft, setRegionDraft] = useState<BrazilRegionCode>('SE');
  const [locationQuery, setLocationQuery] = useState('');
  const regionCode = selectedState?.regionCode ?? regionDraft;

  const debouncedCity = useDebouncedValue(value.city, 250);
  const debouncedDistrict = useDebouncedValue(value.district, 250);
  const debouncedLocationQuery = useDebouncedValue(locationQuery, 300);

  const states = isBrazil ? brazilLocations.filter((state) => state.regionCode === regionCode) : [];

  const citiesQuery = useQuery({
    queryKey: ['location-cities', country, value.stateCode, debouncedCity],
    queryFn: () => locationService.getCities(country, value.stateCode, debouncedCity, 40),
    enabled: isBrazil ? Boolean(selectedState) : debouncedCity.trim().length >= 2,
    staleTime: 24 * 60 * 60_000,
  });

  const neighborhoodsQuery = useQuery({
    queryKey: ['location-neighborhoods', country, value.stateCode, value.city, debouncedDistrict],
    queryFn: () => locationService.getNeighborhoods(country, value.stateCode, value.city, debouncedDistrict),
    enabled: value.city.trim().length >= 2,
    staleTime: 5 * 60_000,
  });

  const locationSearch = useQuery({
    queryKey: ['location-form-search', country, debouncedLocationQuery],
    queryFn: () => locationService.search(debouncedLocationQuery, country),
    enabled: !isBrazil && debouncedLocationQuery.trim().length >= 2,
    staleTime: 5 * 60_000,
  });

  const cities = citiesQuery.data?.length
    ? citiesQuery.data
    : isBrazil
      ? [...(selectedState?.cities ?? [])].filter((city) =>
          city.toLocaleLowerCase('pt-BR').includes(value.city.toLocaleLowerCase('pt-BR')),
        )
      : [];
  const neighborhoods = neighborhoodsQuery.data ?? [];

  function emit(patch: Partial<LocationFieldValue>) {
    onChange({
      countryCode: country,
      state: value.state || '',
      stateCode: value.stateCode || '',
      city: value.city || '',
      district: value.district || '',
      ...patch,
    });
  }

  function updateState(stateCode: string) {
    clearError();
    const state = getBrazilState(stateCode);
    if (!state) {
      emit({ state: '', stateCode: '', city: '', district: '', latitude: undefined, longitude: undefined });
      return;
    }
    setRegionDraft(state.regionCode);
    emit({ state: state.name, stateCode: state.code, city: '', district: '', latitude: undefined, longitude: undefined });
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
      district: resolved.district ?? '',
      latitude: resolved.latitude,
      longitude: resolved.longitude,
    });
    setLocationQuery('');
  }

  function chooseSuggestion(location: NonNullable<(typeof locationSearch.data)>[number]) {
    emit({
      countryCode: country,
      state: location.state,
      stateCode: location.stateCode,
      city: location.city,
      district: location.district ?? '',
      latitude: location.latitude,
      longitude: location.longitude,
    });
    setLocationQuery('');
  }

  const errorText = errorCode === 'denied'
    ? t('location.denied')
    : errorCode === 'unsupported'
      ? t('location.unavailable')
      : errorCode === 'outside_market'
        ? `Your current location is outside ${market.countryName}.`
        : t('location.failed');

  return (
    <div className={className}>
      {showCurrentLocation && (
        <div className="sm:col-span-2 lg:col-span-full">
          <Button type="button" variant="outline" onClick={chooseCurrentLocation} disabled={locating}>
            {locating ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <LocateFixed className="size-4" aria-hidden="true" />}
            {locating ? t('location.locating') : t('location.useMine')}
          </Button>
          {errorCode && <p role="alert" className="mt-2 text-sm font-medium text-amber-800">{errorText}</p>}
        </div>
      )}

      {!isBrazil && (
        <div className="sm:col-span-2 lg:col-span-full">
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold">Search location</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <Input
                value={locationQuery}
                onChange={(event) => setLocationQuery(event.target.value)}
                placeholder={`Search a city or area in ${market.countryName}`}
                className="pl-9"
                autoComplete="off"
              />
            </div>
          </label>
          {locationSearch.isFetching && <p className="mt-2 text-xs text-slate-500">Searching locations…</p>}
          {locationSearch.data?.length ? (
            <div className="mt-2 overflow-hidden rounded-xl border bg-white">
              {locationSearch.data.slice(0, 6).map((location) => (
                <button
                  type="button"
                  key={`${location.stateCode}-${location.city}-${location.district || ''}`}
                  onClick={() => chooseSuggestion(location)}
                  className="block min-h-11 w-full border-b px-3 py-2 text-left text-sm last:border-b-0 hover:bg-slate-50"
                >
                  <span className="font-semibold">{location.district ? `${location.district}, ` : ''}{location.city}</span>
                  {(location.state || location.stateCode) && <span className="ml-1 text-slate-500">{location.state || location.stateCode}</span>}
                </button>
              ))}
            </div>
          ) : null}
        </div>
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
              emit({ state: '', stateCode: '', city: '', district: '', latitude: undefined, longitude: undefined });
            }}
            className="h-11 w-full rounded-xl border bg-white px-3 text-sm"
          >
            {brazilRegions.map((region) => <option key={region.code} value={region.code}>{region.name}</option>)}
          </select>
        </label>
      )}

      <label className="block">
        <span className="mb-1.5 block text-sm font-bold">{labels.state}</span>
        {isBrazil ? (
          <select
            value={selectedState?.code ?? ''}
            onChange={(event) => updateState(event.target.value)}
            aria-invalid={Boolean(errors?.stateCode)}
            className="h-11 w-full rounded-xl border bg-white px-3 text-sm"
          >
            <option value="">{labels.state}</option>
            {states.map((state) => <option key={state.code} value={state.code}>{state.name} ({state.code})</option>)}
          </select>
        ) : (
          <Input
            value={value.state || value.stateCode}
            onChange={(event) => emit({ state: event.target.value, stateCode: event.target.value, latitude: undefined, longitude: undefined })}
            placeholder={labels.state}
            autoComplete="address-level1"
            aria-invalid={Boolean(errors?.stateCode)}
          />
        )}
        {errors?.stateCode && <span className="mt-1 block text-sm text-red-600">{errors.stateCode}</span>}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-bold">{labels.city}</span>
        <Input
          value={value.city}
          list={`${uid}-cities`}
          autoComplete="address-level2"
          disabled={isBrazil && !selectedState}
          onChange={(event) => emit({ city: event.target.value, district: '', latitude: undefined, longitude: undefined })}
          placeholder={placeholders?.city}
          aria-invalid={Boolean(errors?.city)}
        />
        <datalist id={`${uid}-cities`}>{cities.map((city) => <option key={city} value={city} />)}</datalist>
        {errors?.city && <span className="mt-1 block text-sm text-red-600">{errors.city}</span>}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-bold">{labels.district}</span>
        <Input
          value={value.district}
          list={`${uid}-neighborhoods`}
          autoComplete="address-level3"
          disabled={!value.city.trim()}
          onChange={(event) => emit({ district: event.target.value, latitude: undefined, longitude: undefined })}
          placeholder={placeholders?.district}
          aria-invalid={Boolean(errors?.district)}
        />
        <datalist id={`${uid}-neighborhoods`}>{neighborhoods.map((district) => <option key={district} value={district} />)}</datalist>
        {errors?.district && <span className="mt-1 block text-sm text-red-600">{errors.district}</span>}
      </label>
    </div>
  );
}
