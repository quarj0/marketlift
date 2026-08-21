'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Input } from '@/components/ui/input';
import {
  brazilLocations,
  brazilRegions,
  getBrazilState,
  type BrazilRegionCode,
} from '@/data/brazil-locations';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { locationService } from '@/services/location.service';

export type LocationFieldValue = {
  stateCode: string;
  city: string;
  district: string;
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
};

export function LocationFields({
  value,
  onChange,
  labels,
  placeholders,
  errors,
  className = 'grid gap-4 sm:grid-cols-2',
  showRegion = true,
}: Props) {
  const uid = useId().replace(/:/g, '');
  const selectedState = getBrazilState(value.stateCode);
  const [regionCode, setRegionCode] = useState<BrazilRegionCode>(
    selectedState?.regionCode ?? 'SE',
  );

  useEffect(() => {
    if (selectedState) setRegionCode(selectedState.regionCode);
  }, [selectedState]);

  const debouncedCity = useDebouncedValue(value.city, 250);
  const debouncedDistrict = useDebouncedValue(value.district, 250);

  const states = useMemo(
    () => brazilLocations.filter((state) => state.regionCode === regionCode),
    [regionCode],
  );

  const citiesQuery = useQuery({
    queryKey: ['location-cities', selectedState?.code, debouncedCity],
    queryFn: () =>
      locationService.getCities(selectedState?.code ?? '', debouncedCity, 40),
    enabled: Boolean(selectedState),
    staleTime: 24 * 60 * 60_000,
  });

  const neighborhoodsQuery = useQuery({
    queryKey: [
      'location-neighborhoods',
      selectedState?.code,
      value.city,
      debouncedDistrict,
    ],
    queryFn: () =>
      locationService.getNeighborhoods(
        selectedState?.code ?? '',
        value.city,
        debouncedDistrict,
      ),
    enabled: Boolean(selectedState) && value.city.trim().length >= 2,
    staleTime: 5 * 60_000,
  });

  const cities = citiesQuery.data?.length
    ? citiesQuery.data
    : [...(selectedState?.cities ?? [])].filter((city) =>
        city.toLocaleLowerCase('pt-BR').includes(value.city.toLocaleLowerCase('pt-BR')),
      );
  const neighborhoods = neighborhoodsQuery.data ?? [];

  function updateState(stateCode: string) {
    const state = getBrazilState(stateCode);
    if (!state) {
      onChange({ stateCode: '', city: '', district: '' });
      return;
    }
    setRegionCode(state.regionCode);
    onChange({ stateCode: state.code, city: '', district: '' });
  }

  return (
    <div className={className}>
      {showRegion && (
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold">{labels.region}</span>
          <select
            value={regionCode}
            onChange={(event) => {
              const nextRegion = event.target.value as BrazilRegionCode;
              setRegionCode(nextRegion);
              onChange({ stateCode: '', city: '', district: '' });
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
        <select
          value={selectedState?.code ?? ''}
          onChange={(event) => updateState(event.target.value)}
          aria-invalid={Boolean(errors?.stateCode)}
          className="h-11 w-full rounded-xl border bg-white px-3 text-sm"
        >
          <option value="">{labels.state}</option>
          {states.map((state) => (
            <option key={state.code} value={state.code}>
              {state.name} ({state.code})
            </option>
          ))}
        </select>
        {errors?.stateCode && (
          <span className="mt-1 block text-sm text-red-600">{errors.stateCode}</span>
        )}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-bold">{labels.city}</span>
        <Input
          value={value.city}
          list={`${uid}-cities`}
          autoComplete="address-level2"
          disabled={!selectedState}
          onChange={(event) =>
            onChange({ ...value, city: event.target.value, district: '' })
          }
          placeholder={placeholders?.city}
          aria-invalid={Boolean(errors?.city)}
        />
        <datalist id={`${uid}-cities`}>
          {cities.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>
        {errors?.city && (
          <span className="mt-1 block text-sm text-red-600">{errors.city}</span>
        )}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-bold">{labels.district}</span>
        <Input
          value={value.district}
          list={`${uid}-neighborhoods`}
          autoComplete="address-level3"
          disabled={!selectedState || !value.city.trim()}
          onChange={(event) => onChange({ ...value, district: event.target.value })}
          placeholder={placeholders?.district}
          aria-invalid={Boolean(errors?.district)}
        />
        <datalist id={`${uid}-neighborhoods`}>
          {neighborhoods.map((district) => (
            <option key={district} value={district} />
          ))}
        </datalist>
        {errors?.district && (
          <span className="mt-1 block text-sm text-red-600">{errors.district}</span>
        )}
      </label>
    </div>
  );
}
