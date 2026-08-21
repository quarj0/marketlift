import { apiRequest } from '@/lib/api-client';
import {
  brazilLocations,
  brazilRegions,
  getBrazilState,
} from '@/data/brazil-locations';
import type { Location } from '@/types';

type RegionRow = { code: string; name: string };
type StateRow = { code: string; name: string; regionCode: string };
type RemoteLocationRow = {
  state?: string | null;
  stateCode?: string | null;
  city?: string | null;
  district?: string | null;
};

const cityCache = new Map<string, string[]>();

function fallbackCities(stateCode: string, query = '', limit = 80) {
  const needle = query.trim().toLocaleLowerCase('pt-BR');
  return [...(getBrazilState(stateCode)?.cities ?? [])]
    .filter((city) => !needle || city.toLocaleLowerCase('pt-BR').includes(needle))
    .slice(0, limit);
}

function cacheKey(stateCode: string, query: string, limit: number) {
  return `${stateCode.trim().toUpperCase()}:${query.trim().toLocaleLowerCase('pt-BR')}:${limit}`;
}

async function getCities(stateCode: string, query = '', limit = 80) {
  const code = stateCode.trim().toUpperCase();
  if (!code) return [];
  const key = cacheKey(code, query, limit);
  const cached = cityCache.get(key);
  if (cached) return cached;

  try {
    const params = new URLSearchParams({
      state: code,
      limit: String(Math.max(1, Math.min(limit, 200))),
    });
    if (query.trim()) params.set('q', query.trim());
    const response = await apiRequest<{ cities: string[] }>(
      `/api/v1/locations/cities/?${params.toString()}`,
    );
    const cities = response.cities ?? [];
    if (cities.length) {
      cityCache.set(key, cities);
      return cities;
    }
  } catch {
    // Keep forms usable if the reference-catalog endpoint is temporarily down.
  }

  const fallback = fallbackCities(code, query, limit);
  cityCache.set(key, fallback);
  return fallback;
}

function pushLocation(results: Location[], seen: Set<string>, location: Location) {
  const key = `${location.stateCode}:${location.city}`.toLocaleLowerCase('pt-BR');
  if (seen.has(key) || results.length >= 20) return;
  seen.add(key);
  results.push(location);
}

export const locationService = {
  async getRegions(): Promise<RegionRow[]> {
    try {
      const response = await apiRequest<{ regions: RegionRow[] }>(
        '/api/v1/locations/regions/',
      );
      return response.regions ?? [];
    } catch {
      return brazilRegions.map(({ code, name }) => ({ code, name }));
    }
  },

  async getStates(regionCode?: string): Promise<StateRow[]> {
    try {
      const params = new URLSearchParams();
      if (regionCode) params.set('region', regionCode);
      const serialized = params.toString();
      const suffix = serialized ? `?${serialized}` : '';
      const response = await apiRequest<{ states: StateRow[] }>(
        `/api/v1/locations/states/${suffix}`,
      );
      return response.states ?? [];
    } catch {
      return brazilLocations
        .filter((state) => !regionCode || state.regionCode === regionCode)
        .map(({ code, name, regionCode: stateRegionCode }) => ({
          code,
          name,
          regionCode: stateRegionCode,
        }));
    }
  },

  getCities,

  async getNeighborhoods(
    stateCode: string,
    city: string,
    query = '',
  ): Promise<string[]> {
    if (!stateCode.trim() || !city.trim()) return [];
    const params = new URLSearchParams({
      state: stateCode.trim(),
      city: city.trim(),
    });
    if (query.trim()) params.set('q', query.trim());
    try {
      const response = await apiRequest<{ suggestions: string[] }>(
        `/api/v1/locations/neighborhoods/?${params.toString()}`,
      );
      return response.suggestions ?? [];
    } catch {
      return [];
    }
  },

  async search(query: string): Promise<Location[]> {
    const raw = query.trim();
    const normalized = raw.toLocaleLowerCase('pt-BR');
    if (!normalized) return [];

    const results: Location[] = [];
    const seen = new Set<string>();

    // Common locations remain instant from the bundled fallback catalogue.
    for (const state of brazilLocations) {
      const stateMatches = `${state.name} ${state.code}`
        .toLocaleLowerCase('pt-BR')
        .includes(normalized);
      for (const city of state.cities) {
        if (
          stateMatches ||
          `${city} ${state.name} ${state.code}`
            .toLocaleLowerCase('pt-BR')
            .includes(normalized)
        ) {
          pushLocation(results, seen, {
            state: state.name,
            stateCode: state.code,
            city,
          });
        }
      }
    }
    // Common bundled locations should stay instant and should not wait for a
    // geocoding provider round-trip. Less common municipality names fall back
    // to the backend resolver below.
    if (results.length > 0) return results;

    try {
      const params = new URLSearchParams({ q: raw, limit: '8' });
      const response = await apiRequest<{ results: RemoteLocationRow[] }>(
        `/api/v1/locations/search/?${params.toString()}`,
      );
      for (const row of response.results ?? []) {
        const state = getBrazilState(row.stateCode ?? '');
        const city = String(row.city ?? '').trim();
        if (!state || !city) continue;
        pushLocation(results, seen, {
          state: state.name,
          stateCode: state.code,
          city,
          ...(row.district ? { district: String(row.district).trim() } : {}),
        });
      }
      if (results.length > 0) return results;
    } catch {
      // The official state-scoped catalogue remains available as a fallback.
    }

    // A state name/code narrows the complete IBGE-backed municipality lookup to
    // one state instead of making the browser query an external service itself.
    const matchingStates = brazilLocations.filter((state) =>
      `${state.name} ${state.code}`
        .toLocaleLowerCase('pt-BR')
        .includes(normalized),
    );

    const suffixMatch = raw.match(/(?:,|\s)\s*([A-Za-z]{2})\s*$/);
    const suffixState = suffixMatch
      ? getBrazilState(suffixMatch[1].toUpperCase())
      : undefined;
    const candidateStates = suffixState
      ? [suffixState]
      : matchingStates.slice(0, 5);

    for (const state of candidateStates) {
      const cityNeedle = suffixState
        ? raw.replace(/(?:,|\s)\s*[A-Za-z]{2}\s*$/, '').trim()
        : '';
      const cities = await getCities(state.code, cityNeedle, 40);
      for (const city of cities) {
        if (
          !cityNeedle ||
          city.toLocaleLowerCase('pt-BR').includes(cityNeedle.toLocaleLowerCase('pt-BR'))
        ) {
          pushLocation(results, seen, {
            state: state.name,
            stateCode: state.code,
            city,
          });
        }
      }
      if (results.length >= 20) break;
    }

    return results;
  },
};
