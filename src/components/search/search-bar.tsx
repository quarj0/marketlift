'use client';

import { type FormEvent, useId, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getBrazilState } from '@/data/brazil-locations';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useLocale } from '@/providers/locale-provider';
import { useMarketplaceLocation } from '@/providers/marketplace-location-provider';
import { locationService } from '@/services/location.service';
import type { Location } from '@/types';

function locationFromLabel(label: string): Location | null {
  const raw = label.trim();
  if (!raw) return null;
  const match = raw.match(/^(.*?)(?:,|\s)\s*([A-Za-z]{2})\s*$/);
  if (!match) return null;
  const state = getBrazilState(match[2].toUpperCase());
  const city = match[1].trim();
  if (!state || !city) return null;
  return { state: state.name, stateCode: state.code, city };
}

export function SearchBar({
  compact = false,
  location,
  showSubmitButton = true,
}: {
  compact?: boolean;
  location?: Location;
  showSubmitButton?: boolean;
}) {
  const router = useRouter();
  const { t } = useLocale();
  const { location: marketplaceLocation } = useMarketplaceLocation();
  const activeLocation = location ?? marketplaceLocation;
  const datalistId = useId().replace(/:/g, '');
  const [q, setQ] = useState('');
  const activeLocationLabel = `${activeLocation.city}, ${activeLocation.stateCode}`;
  const activeLocationKey = `${activeLocation.stateCode}:${activeLocation.city}:${activeLocation.district ?? ''}:${activeLocation.latitude ?? ''}:${activeLocation.longitude ?? ''}`;
  const [locationDraft, setLocationDraft] = useState<{ key: string; value: string } | null>(null);
  const localLocation = locationDraft?.key === activeLocationKey
    ? locationDraft.value
    : activeLocationLabel;
  const debouncedLocation = useDebouncedValue(localLocation, 250);

  const locationSuggestions = useQuery({
    queryKey: ['search-bar-location-suggestions', debouncedLocation],
    queryFn: () => locationService.search(debouncedLocation),
    enabled: !compact && debouncedLocation.trim().length >= 2,
    staleTime: 5 * 60_000,
  });

  const suggestionLabels = useMemo(
    () =>
      (locationSuggestions.data ?? []).map(
        (item) => `${item.city}, ${item.stateCode}`,
      ),
    [locationSuggestions.data],
  );

  function submit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();

    if (q.trim()) params.set('q', q.trim());

    const selectedLocation =
      (compact && location ? location : null) ??
      (localLocation.trim().toLocaleLowerCase('pt-BR') ===
      activeLocationLabel.toLocaleLowerCase('pt-BR')
        ? activeLocation
        : null) ??
      locationFromLabel(localLocation) ??
      locationSuggestions.data?.find(
        (item) =>
          `${item.city}, ${item.stateCode}`.toLocaleLowerCase('pt-BR') ===
          localLocation.trim().toLocaleLowerCase('pt-BR'),
      ) ??
      null;

    if (selectedLocation) {
      const state = getBrazilState(selectedLocation.stateCode);
      if (state) params.set('region', state.regionCode);
      params.set('state', selectedLocation.stateCode);
      params.set('city', selectedLocation.city);
      if (selectedLocation.district) {
        params.set('district', selectedLocation.district);
      }
      if (
        Number.isFinite(selectedLocation.latitude) &&
        Number.isFinite(selectedLocation.longitude)
      ) {
        params.set('latitude', String(selectedLocation.latitude));
        params.set('longitude', String(selectedLocation.longitude));
        params.set('radiusKm', '25');
        params.set('sort', 'distance');
      }
    } else if (!compact && localLocation.trim()) {
      // A user can still search a city name before selecting a suggestion. The
      // results page then lets them narrow it to state/neighborhood precisely.
      params.set('city', localLocation.trim());
    }

    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={submit}
      className={
        compact
          ? 'flex w-full gap-2'
          : 'grid gap-3 rounded-2xl bg-white p-3 shadow-soft md:grid-cols-[1fr_260px_auto]'
      }
    >
      <label className="relative min-w-0 flex-1">
        <Search className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
        <Input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          className="pl-11"
          placeholder={t('search.placeholder')}
          aria-label={t('search.listings')}
        />
      </label>

      {!compact && (
        <label className="relative">
          <MapPin className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
          <Input
            value={localLocation}
            onChange={(event) => setLocationDraft({ key: activeLocationKey, value: event.target.value })}
            list={`${datalistId}-locations`}
            className="pl-11"
            aria-label={t('search.location')}
            autoComplete="address-level2"
          />
          <datalist id={`${datalistId}-locations`}>
            {suggestionLabels.map((label) => (
              <option key={label} value={label} />
            ))}
          </datalist>
        </label>
      )}

      {showSubmitButton && (
        <Button type="submit" size={compact ? 'default' : 'lg'} className="shrink-0">
          <Search className="size-4" />
          {compact ? <span className="sr-only">{t('common.search')}</span> : t('common.search')}
        </Button>
      )}
    </form>
  );
}
