'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { getBrazilState } from '@/data/brazil-locations';
import { useMarket } from '@/providers/market-provider';
import type { Location } from '@/types';

const STORAGE_PREFIX = 'marketlift.marketplaceLocation';

const DEFAULTS: Record<string, Location> = {
  BR: { countryCode: 'BR', state: 'São Paulo', stateCode: 'SP', city: 'São Paulo' },
  GH: { countryCode: 'GH', state: 'Greater Accra', stateCode: 'AA', city: 'Accra' },
  NG: { countryCode: 'NG', state: 'Lagos', stateCode: 'LA', city: 'Lagos' },
  KE: { countryCode: 'KE', state: 'Nairobi County', stateCode: '30', city: 'Nairobi' },
  ZA: { countryCode: 'ZA', state: 'Gauteng', stateCode: 'GP', city: 'Johannesburg' },
  CI: { countryCode: 'CI', state: 'Abidjan', stateCode: '', city: 'Abidjan' },
};

type MarketplaceLocationContextValue = {
  location: Location;
  setLocation: (location: Location) => void;
};

const MarketplaceLocationContext = createContext<MarketplaceLocationContextValue | null>(null);

function storageKey(countryCode: string) {
  return `${STORAGE_PREFIX}.${countryCode}`;
}

function fallbackLocation(countryCode: string, countryName: string): Location {
  return DEFAULTS[countryCode] || { countryCode, state: '', stateCode: '', city: countryName };
}

function normalizeLocation(value: unknown, countryCode: string): Location | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Partial<Location>;
  if (row.countryCode && row.countryCode.toUpperCase() !== countryCode) return null;
  const city = String(row.city || '').trim();
  if (!city) return null;
  let state = String(row.state || '').trim();
  let stateCode = String(row.stateCode || '').trim().toUpperCase();
  if (countryCode === 'BR') {
    const brazilState = getBrazilState(stateCode);
    if (!brazilState) return null;
    state = brazilState.name;
    stateCode = brazilState.code;
  }
  const district = String(row.district || '').trim();
  const latitude = typeof row.latitude === 'number' ? row.latitude : Number.NaN;
  const longitude = typeof row.longitude === 'number' ? row.longitude : Number.NaN;
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  return {
    countryCode,
    state,
    stateCode,
    city,
    ...(district ? { district } : {}),
    ...(hasCoordinates ? { latitude, longitude } : {}),
  };
}

function readInitialLocation(countryCode: string, countryName: string): Location {
  let next = fallbackLocation(countryCode, countryName);
  if (typeof window === 'undefined') return next;
  try {
    const raw = window.localStorage.getItem(storageKey(countryCode));
    const stored = raw ? normalizeLocation(JSON.parse(raw), countryCode) : null;
    if (stored) next = stored;
  } catch {
    // Invalid/stale local data falls back to the market default.
  }
  return next;
}

function MarketplaceLocationProviderForMarket({
  children,
  countryCode,
  countryName,
}: {
  children: ReactNode;
  countryCode: string;
  countryName: string;
}) {
  const [location, setLocationState] = useState<Location>(() => readInitialLocation(countryCode, countryName));

  const setLocation = useCallback((next: Location) => {
    const normalized = normalizeLocation({ ...next, countryCode }, countryCode);
    if (!normalized) return;
    setLocationState(normalized);
    try {
      window.localStorage.setItem(storageKey(countryCode), JSON.stringify(normalized));
    } catch {
      // Private browsing/storage policies must not block location selection.
    }
  }, [countryCode]);

  const value = useMemo(() => ({ location, setLocation }), [location, setLocation]);
  return <MarketplaceLocationContext.Provider value={value}>{children}</MarketplaceLocationContext.Provider>;
}

export function MarketplaceLocationProvider({ children }: { children: ReactNode }) {
  const { market } = useMarket();
  return (
    <MarketplaceLocationProviderForMarket
      key={market.code}
      countryCode={market.code}
      countryName={market.countryName}
    >
      {children}
    </MarketplaceLocationProviderForMarket>
  );
}

export function useMarketplaceLocation() {
  const value = useContext(MarketplaceLocationContext);
  if (!value) throw new Error('useMarketplaceLocation must be used inside MarketplaceLocationProvider.');
  return value;
}
