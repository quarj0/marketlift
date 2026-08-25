import { apiRequest } from '@/lib/api-client';
import {
  brazilLocations,
  brazilRegions,
  getBrazilState,
} from '@/data/brazil-locations';
import type { Location } from '@/types';

type RegionRow = { code: string; name: string };
type StateRow = { code: string; name: string; regionCode?: string };
type RemoteLocationRow = {
  countryCode?: string | null;
  state?: string | null;
  stateCode?: string | null;
  city?: string | null;
  district?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

const cityCache = new Map<string, string[]>();

function localeFor(countryCode: string) {
  return countryCode.toUpperCase() === 'BR' ? 'pt-BR' : 'en';
}

function fallbackCities(stateCode: string, query = '', limit = 80) {
  const needle = query.trim().toLocaleLowerCase('pt-BR');
  return [...(getBrazilState(stateCode)?.cities ?? [])]
    .filter((city) => !needle || city.toLocaleLowerCase('pt-BR').includes(needle))
    .slice(0, limit);
}

function cacheKey(countryCode: string, stateCode: string, query: string, limit: number) {
  return `${countryCode.trim().toUpperCase()}:${stateCode.trim().toUpperCase()}:${query.trim().toLocaleLowerCase(localeFor(countryCode))}:${limit}`;
}

function toLocation(row: RemoteLocationRow, countryCode: string): Location | null {
  const code = countryCode.trim().toUpperCase();
  const city = String(row.city ?? '').trim();
  if (!city) return null;

  if (code === 'BR') {
    const state = getBrazilState(row.stateCode ?? '');
    if (!state) return null;
    return {
      countryCode: 'BR',
      state: state.name,
      stateCode: state.code,
      city,
      ...(row.district ? { district: String(row.district).trim() } : {}),
      ...(Number.isFinite(row.latitude) ? { latitude: Number(row.latitude) } : {}),
      ...(Number.isFinite(row.longitude) ? { longitude: Number(row.longitude) } : {}),
    };
  }

  return {
    countryCode: code,
    state: String(row.state ?? '').trim(),
    stateCode: String(row.stateCode ?? '').trim(),
    city,
    ...(row.district ? { district: String(row.district).trim() } : {}),
    ...(Number.isFinite(row.latitude) ? { latitude: Number(row.latitude) } : {}),
    ...(Number.isFinite(row.longitude) ? { longitude: Number(row.longitude) } : {}),
  };
}

function pushLocation(results: Location[], seen: Set<string>, location: Location) {
  const key = `${location.countryCode || ''}:${location.stateCode}:${location.city}:${location.district || ''}`.toLocaleLowerCase(
    localeFor(location.countryCode || ''),
  );
  if (seen.has(key) || results.length >= 20) return;
  seen.add(key);
  results.push(location);
}

export const locationService = {
  async getRegions(countryCode = 'BR'): Promise<RegionRow[]> {
    const country = countryCode.trim().toUpperCase();
    try {
      const params = new URLSearchParams({ countryCode: country });
      const response = await apiRequest<{ regions: RegionRow[] }>(
        `/api/v1/locations/regions/?${params.toString()}`,
      );
      return response.regions ?? [];
    } catch {
      return country === 'BR' ? brazilRegions.map(({ code, name }) => ({ code, name })) : [];
    }
  },

  async getStates(countryCode = 'BR', regionCode?: string): Promise<StateRow[]> {
    const country = countryCode.trim().toUpperCase();
    try {
      const params = new URLSearchParams({ countryCode: country });
      if (regionCode) params.set('region', regionCode);
      const response = await apiRequest<{ states: StateRow[] }>(
        `/api/v1/locations/states/?${params.toString()}`,
      );
      return response.states ?? [];
    } catch {
      if (country !== 'BR') return [];
      return brazilLocations
        .filter((state) => !regionCode || state.regionCode === regionCode)
        .map(({ code, name, regionCode: stateRegionCode }) => ({
          code,
          name,
          regionCode: stateRegionCode,
        }));
    }
  },

  async getCities(countryCode: string, stateCode: string, query = '', limit = 80) {
    const country = countryCode.trim().toUpperCase();
    const state = stateCode.trim().toUpperCase();
    if (country === 'BR' && !state) return [];
    const key = cacheKey(country, state, query, limit);
    const cached = cityCache.get(key);
    if (cached) return cached;

    try {
      const params = new URLSearchParams({
        countryCode: country,
        limit: String(Math.max(1, Math.min(limit, 200))),
      });
      if (state) params.set('state', state);
      if (query.trim()) params.set('q', query.trim());
      const response = await apiRequest<{ cities: string[] }>(
        `/api/v1/locations/cities/?${params.toString()}`,
      );
      const cities = response.cities ?? [];
      if (cities.length || country !== 'BR') {
        cityCache.set(key, cities);
        return cities;
      }
    } catch {
      // Brazil has a bundled fallback catalog. Geocoder markets simply return no inventory suggestions.
    }

    const fallback = country === 'BR' ? fallbackCities(state, query, limit) : [];
    cityCache.set(key, fallback);
    return fallback;
  },

  async getNeighborhoods(
    countryCode: string,
    stateCode: string,
    city: string,
    query = '',
  ): Promise<string[]> {
    const country = countryCode.trim().toUpperCase();
    if (!city.trim()) return [];
    const params = new URLSearchParams({ countryCode: country, city: city.trim() });
    if (stateCode.trim()) params.set('state', stateCode.trim());
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

  async reverse(latitude: number, longitude: number, countryCode = 'BR'): Promise<Location | null> {
    const country = countryCode.trim().toUpperCase();
    const params = new URLSearchParams({
      lat: String(latitude),
      lng: String(longitude),
      countryCode: country,
    });
    const response = await apiRequest<{ result: RemoteLocationRow | null }>(
      `/api/v1/locations/reverse/?${params.toString()}`,
    );
    if (!response.result) return null;
    return toLocation(
      { ...response.result, latitude, longitude },
      country,
    );
  },

  async search(query: string, countryCode = 'BR'): Promise<Location[]> {
    const raw = query.trim();
    const country = countryCode.trim().toUpperCase();
    const locale = localeFor(country);
    const normalized = raw.toLocaleLowerCase(locale);
    if (!normalized) return [];

    const results: Location[] = [];
    const seen = new Set<string>();

    if (country === 'BR') {
      for (const state of brazilLocations) {
        const stateMatches = `${state.name} ${state.code}`.toLocaleLowerCase('pt-BR').includes(normalized);
        for (const city of state.cities) {
          if (
            stateMatches ||
            `${city} ${state.name} ${state.code}`.toLocaleLowerCase('pt-BR').includes(normalized)
          ) {
            pushLocation(results, seen, {
              countryCode: 'BR',
              state: state.name,
              stateCode: state.code,
              city,
            });
          }
        }
      }
      if (results.length > 0) return results;
    }

    try {
      const params = new URLSearchParams({ q: raw, limit: '8', countryCode: country });
      const response = await apiRequest<{ results: RemoteLocationRow[] }>(
        `/api/v1/locations/search/?${params.toString()}`,
      );
      for (const row of response.results ?? []) {
        const location = toLocation(row, country);
        if (location) pushLocation(results, seen, location);
      }
      if (results.length > 0 || country !== 'BR') return results;
    } catch {
      if (country !== 'BR') return [];
    }

    const matchingStates = brazilLocations.filter((state) =>
      `${state.name} ${state.code}`.toLocaleLowerCase('pt-BR').includes(normalized),
    );
    const suffixMatch = raw.match(/(?:,|\s)\s*([A-Za-z]{2})\s*$/);
    const suffixState = suffixMatch ? getBrazilState(suffixMatch[1].toUpperCase()) : undefined;
    const candidateStates = suffixState ? [suffixState] : matchingStates.slice(0, 5);

    for (const state of candidateStates) {
      const cityNeedle = suffixState
        ? raw.replace(/(?:,|\s)\s*[A-Za-z]{2}\s*$/, '').trim()
        : '';
      const cities = await this.getCities('BR', state.code, cityNeedle, 40);
      for (const city of cities) {
        if (!cityNeedle || city.toLocaleLowerCase('pt-BR').includes(cityNeedle.toLocaleLowerCase('pt-BR'))) {
          pushLocation(results, seen, {
            countryCode: 'BR',
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
