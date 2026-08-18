'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronRight, LocateFixed, MapPin, Search, X } from 'lucide-react';
import { brazilLocations } from '@/mocks/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Location } from '@/types';

interface LocationSelectorProps {
  value?: Location;
  compact?: boolean;
  onChange?: (location: Location) => void;
}

const recentLocations: Location[] = [
  { state: 'São Paulo', stateCode: 'SP', city: 'São Paulo' },
  { state: 'Rio de Janeiro', stateCode: 'RJ', city: 'Rio de Janeiro' },
];

export function LocationSelector({ value, compact = false, onChange }: LocationSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedState, setSelectedState] = useState(value?.stateCode ?? 'SP');
  const current = value ?? { state: 'São Paulo', stateCode: 'SP', city: 'São Paulo' };

  const state = brazilLocations.find((item) => item.code === selectedState) ?? brazilLocations[0];
  const filteredStates = useMemo(
    () => brazilLocations.filter((item) => `${item.name} ${item.code}`.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  function choose(location: Location) {
    onChange?.(location);
    setOpen(false);
    setQuery('');
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 rounded-xl text-left transition hover:bg-slate-100 ${compact ? 'px-2 py-2' : 'px-3 py-2'}`}
        aria-label="Choose location"
      >
        <MapPin className="size-4 shrink-0 text-brand-700" />
        <span className="min-w-0">
          {!compact && <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">Location</span>}
          <span className="block max-w-36 truncate text-sm font-semibold text-slate-700">{current.city}, {current.stateCode}</span>
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Select location">
          <button type="button" className="absolute inset-0 cursor-default" onClick={() => setOpen(false)} aria-label="Close location selector" />
          <div className="relative z-10 max-h-[88vh] w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-3xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="text-lg font-black">Choose your location</h2>
                <p className="text-sm text-slate-500">See listings closer to you.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)} aria-label="Close"><X className="size-5" /></Button>
            </div>

            <div className="p-5">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => choose({ state: 'São Paulo', stateCode: 'SP', city: 'São Paulo' })}
              >
                <LocateFixed className="size-4 text-brand-700" /> Use my location
              </Button>

              <div className="relative mt-4">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search state or city" className="pl-10" />
              </div>

              {!query && (
                <div className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent locations</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {recentLocations.map((location) => (
                      <button type="button" key={`${location.city}-${location.stateCode}`} onClick={() => choose(location)} className="rounded-full border px-3 py-2 text-sm font-medium hover:border-brand-300 hover:bg-brand-50">
                        {location.city}, {location.stateCode}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 grid min-h-64 gap-5 sm:grid-cols-[0.9fr_1.1fr]">
                <div className="max-h-72 overflow-y-auto rounded-xl border p-1">
                  {filteredStates.map((item) => (
                    <button
                      type="button"
                      key={item.code}
                      onClick={() => setSelectedState(item.code)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm ${selectedState === item.code ? 'bg-brand-50 font-bold text-brand-800' : 'hover:bg-slate-50'}`}
                    >
                      <span>{item.name} <span className="text-slate-400">({item.code})</span></span>
                      {selectedState === item.code ? <Check className="size-4" /> : <ChevronRight className="size-4 text-slate-300" />}
                    </button>
                  ))}
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Cities in {state.name}</p>
                  <div className="max-h-72 overflow-y-auto rounded-xl border p-1">
                    {state.cities.filter((city) => city.toLowerCase().includes(query.toLowerCase())).map((city) => (
                      <button
                        type="button"
                        key={city}
                        onClick={() => choose({ state: state.name, stateCode: state.code, city })}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-slate-50"
                      >
                        {city}<ChevronRight className="size-4 text-slate-300" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
