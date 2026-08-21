'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { getBrazilState } from '@/data/brazil-locations';
import type { Location } from '@/types';

const STORAGE_KEY = 'marketlift.marketplaceLocation';
const DEFAULT_LOCATION: Location = {
  state: 'São Paulo',
  stateCode: 'SP',
  city: 'São Paulo',
};

type MarketplaceLocationContextValue = {
  location: Location;
  setLocation: (location: Location) => void;
};

const MarketplaceLocationContext = createContext<MarketplaceLocationContextValue | null>(
  null,
);

function normalizeStoredLocation(value: unknown): Location | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Partial<Location>;
  const state = getBrazilState(String(row.stateCode || '').toUpperCase());
  const city = String(row.city || '').trim();
  if (!state || !city) return null;
  const district = String(row.district || '').trim();
  const latitude = typeof row.latitude === 'number' ? row.latitude : Number.NaN;
  const longitude = typeof row.longitude === 'number' ? row.longitude : Number.NaN;
  const hasCoordinates =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;
  return {
    state: state.name,
    stateCode: state.code,
    city,
    ...(district ? { district } : {}),
    ...(hasCoordinates ? { latitude, longitude } : {}),
  };
}

export function MarketplaceLocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<Location>(DEFAULT_LOCATION);

  useEffect(() => {
    let frame = 0;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const stored = normalizeStoredLocation(JSON.parse(raw));
      if (stored) {
        frame = window.requestAnimationFrame(() => setLocationState(stored));
      }
    } catch {
      // Storage restrictions or old invalid values must not block browsing.
    }
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const setLocation = useCallback((next: Location) => {
    const normalized = normalizeStoredLocation(next);
    if (!normalized) return;
    setLocationState(normalized);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch {
      // Private browsing/storage policies must not block location selection.
    }
  }, []);

  const value = useMemo(() => ({ location, setLocation }), [location, setLocation]);

  return (
    <MarketplaceLocationContext.Provider value={value}>
      {children}
    </MarketplaceLocationContext.Provider>
  );
}

export function useMarketplaceLocation() {
  const value = useContext(MarketplaceLocationContext);
  if (!value) {
    throw new Error(
      'useMarketplaceLocation must be used inside MarketplaceLocationProvider.',
    );
  }
  return value;
}
