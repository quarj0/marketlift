'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronRight, LoaderCircle, LocateFixed, MapPin, Search } from 'lucide-react';

import { brazilLocations } from '@/data/brazil-locations';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useCurrentLocation } from '@/hooks/use-current-location';
import { locationService } from '@/services/location.service';
import { useLocale } from '@/providers/locale-provider';
import { useMarket } from '@/providers/market-provider';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Location } from '@/types';

interface LocationSelectorProps {
  value?: Location;
  compact?: boolean;
  inverse?: boolean;
  onChange?: (location: Location) => void;
}

function recentKey(countryCode: string) {
  return `marketlift.recentLocations.${countryCode}`;
}

function readRecentLocations(countryCode: string): Location[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(recentKey(countryCode)) || '[]');
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch {
    return [];
  }
}

function persistRecent(countryCode: string, location: Location) {
  if (typeof window === 'undefined') return;
  const current = readRecentLocations(countryCode);
  const next = [location, ...current.filter((item) =>
    `${item.city}|${item.stateCode}|${item.district || ''}` !== `${location.city}|${location.stateCode}|${location.district || ''}`,
  )].slice(0, 5);
  try {
    window.localStorage.setItem(recentKey(countryCode), JSON.stringify(next));
  } catch {
    // Recent locations are only a convenience.
  }
}

function locationLabel(location: Location) {
  return [location.district, location.city, location.stateCode || location.state]
    .filter(Boolean)
    .join(', ');
}

export function LocationSelector({ value, compact = false, inverse = false, onChange }: LocationSelectorProps) {
  const { t } = useLocale();
  const { market } = useMarket();
  const country = market.code;
  const isBrazil = country === 'BR';
  const [open, setOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState({ country, value: '' });
  const [recentLocations, setRecentLocations] = useState<Location[]>([]);
  const [stateDraft, setStateDraft] = useState({
    country,
    code: value?.stateCode || (isBrazil ? 'SP' : ''),
  });
  const query = searchDraft.country === country ? searchDraft.value : '';
  const selectedState = stateDraft.country === country
    ? stateDraft.code
    : value?.stateCode || (isBrazil ? 'SP' : '');
  const setQuery = (next: string) => setSearchDraft({ country, value: next });
  const setSelectedState = (code: string) => setStateDraft({ country, code });
  const debouncedQuery = useDebouncedValue(query, 250);
  const { locate, locating, errorCode, clearError } = useCurrentLocation(country);


  const searchQuery = useQuery({
    queryKey: ['location-selector-search', country, debouncedQuery],
    queryFn: () => locationService.search(debouncedQuery, country),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 5 * 60_000,
  });

  const state = isBrazil
    ? brazilLocations.find((item) => item.code === selectedState) || brazilLocations[0]
    : undefined;

  const filteredStates = useMemo(() => {
    if (!isBrazil || !query.trim()) return isBrazil ? brazilLocations : [];
    const needle = query.trim().toLocaleLowerCase('pt-BR');
    return brazilLocations.filter((item) =>
      `${item.name} ${item.code}`.toLocaleLowerCase('pt-BR').includes(needle),
    );
  }, [isBrazil, query]);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setRecentLocations(readRecentLocations(country));
      clearError();
      if (value?.stateCode) setSelectedState(value.stateCode);
    }
    setOpen(nextOpen);
  }

  function choose(location: Location) {
    const normalized = { ...location, countryCode: country };
    persistRecent(country, normalized);
    setRecentLocations(readRecentLocations(country));
    onChange?.(normalized);
    setQuery('');
    setOpen(false);
  }

  async function chooseCurrent() {
    const resolved = await locate();
    if (resolved) choose(resolved);
  }

  const current = value;
  const triggerText = current?.city || market.countryName;
  const errorText = errorCode === 'denied'
    ? t('location.denied')
    : errorCode === 'unsupported'
      ? t('location.unavailable')
      : errorCode === 'outside_market'
        ? `Your current location is outside ${market.countryName}.`
        : t('location.failed');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex min-h-10 items-center gap-2 rounded-xl px-2.5 text-left text-sm font-semibold transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-brand-400',
            inverse && 'text-white hover:bg-white/10',
            compact && 'max-w-48',
          )}
        >
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{triggerText}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0">
        <div className="border-b p-5 sm:p-6">
          <DialogTitle>{t('location.title')}</DialogTitle>
          <DialogDescription className="mt-1">
            Browse listings in {market.countryName} by city or area.
          </DialogDescription>
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${market.countryName}`}
              className="pl-9"
              autoFocus
            />
          </div>
          <Button type="button" variant="outline" className="mt-3" onClick={chooseCurrent} disabled={locating}>
            {locating ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <LocateFixed className="size-4" aria-hidden="true" />}
            {locating ? t('location.locating') : t('location.useMine')}
          </Button>
          {errorCode && <p role="alert" className="mt-2 text-sm font-medium text-amber-800">{errorText}</p>}
        </div>

        <div className="max-h-[62vh] overflow-y-auto p-5 sm:p-6">
          {query.trim().length >= 2 && (
            <section>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('location.suggestions')}</p>
              {searchQuery.isFetching && <p className="mt-3 text-sm text-slate-500">Searching…</p>}
              <div className="mt-2 grid gap-1 rounded-xl border p-1 sm:grid-cols-2">
                {searchQuery.data?.map((location) => (
                  <button
                    type="button"
                    key={`${location.stateCode}-${location.city}-${location.district || ''}`}
                    onClick={() => choose(location)}
                    className="flex min-h-11 items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand-400"
                  >
                    <span>{locationLabel(location)}</span>
                    <ChevronRight className="size-4 text-slate-300" aria-hidden="true" />
                  </button>
                ))}
                {!searchQuery.isFetching && searchQuery.data?.length === 0 && (
                  <p className="p-3 text-sm text-slate-500 sm:col-span-2">No matching locations found.</p>
                )}
              </div>
            </section>
          )}

          {!query.trim() && recentLocations.length > 0 && (
            <section>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent</p>
              <div className="mt-2 grid gap-1 sm:grid-cols-2">
                {recentLocations.map((location) => (
                  <button
                    type="button"
                    key={`${location.stateCode}-${location.city}-${location.district || ''}`}
                    onClick={() => choose(location)}
                    className="flex min-h-11 items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm hover:bg-slate-50"
                  >
                    <span>{locationLabel(location)}</span>
                    {current && locationLabel(current) === locationLabel(location) && <Check className="size-4 text-brand-700" aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </section>
          )}

          {isBrazil && query.trim().length < 2 && state && (
            <section className="mt-5 grid min-h-64 gap-5 sm:grid-cols-[0.9fr_1.1fr]">
              <div className="max-h-72 overflow-y-auto rounded-xl border p-1">
                {filteredStates.map((item) => (
                  <button
                    type="button"
                    key={item.code}
                    onClick={() => setSelectedState(item.code)}
                    aria-pressed={selectedState === item.code}
                    className={cn(
                      'flex min-h-11 w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm focus-visible:ring-2 focus-visible:ring-brand-400',
                      selectedState === item.code ? 'bg-brand-50 font-bold text-brand-800' : 'hover:bg-slate-50',
                    )}
                  >
                    <span>{item.name} <span className="text-slate-400">({item.code})</span></span>
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </button>
                ))}
              </div>
              <div className="max-h-72 overflow-y-auto rounded-xl border p-1">
                {state.cities.map((city) => (
                  <button
                    type="button"
                    key={city}
                    onClick={() => choose({ countryCode: 'BR', state: state.name, stateCode: state.code, city })}
                    className="flex min-h-11 w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-slate-50"
                  >
                    <span>{city}</span>
                    <ChevronRight className="size-4 text-slate-300" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {!isBrazil && !query.trim() && recentLocations.length === 0 && (
            <div className="grid min-h-48 place-items-center rounded-xl border border-dashed text-center text-sm text-slate-500">
              <div><MapPin className="mx-auto mb-2 size-6" aria-hidden="true" />Search for a city or area in {market.countryName}.</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
