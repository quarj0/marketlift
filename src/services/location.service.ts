import { apiRequest } from '@/lib/api-client';
import { brazilLocations, brazilRegions, getBrazilState } from '@/data/brazil-locations';
import type { Location } from '@/types';

const municipalityCache = new Map<string, string[]>();
const IBGE_BASE = 'https://servicodados.ibge.gov.br/api/v1/localidades';

type IbgeMunicipality = { nome?: string };

function fallbackCities(stateCode: string) {
  return [...(getBrazilState(stateCode)?.cities ?? [])];
}

async function fetchMunicipalities(stateCode: string) {
  const code = stateCode.trim().toUpperCase();
  if (!code) return [];
  const cached = municipalityCache.get(code);
  if (cached) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(`${IBGE_BASE}/estados/${encodeURIComponent(code)}/municipios?orderBy=nome`, {
      signal: controller.signal,
      cache: 'force-cache',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`Municipality catalog returned ${response.status}`);
    const payload = (await response.json()) as IbgeMunicipality[];
    const cities = payload
      .map((item) => item.nome?.trim() || '')
      .filter(Boolean);
    if (cities.length) {
      municipalityCache.set(code, cities);
      return cities;
    }
  } catch {
    // The marketplace remains usable when the reference-data service is offline.
  } finally {
    clearTimeout(timeout);
  }

  const fallback = fallbackCities(code);
  municipalityCache.set(code, fallback);
  return fallback;
}

export const locationService = {
  async getRegions() {
    return [...brazilRegions];
  },

  async getStates(regionCode?: string) {
    return brazilLocations
      .filter((state) => !regionCode || state.regionCode === regionCode)
      .map(({ code, name, regionCode: stateRegionCode }) => ({ code, name, regionCode: stateRegionCode }));
  },

  getCities: fetchMunicipalities,

  async getNeighborhoods(stateCode: string, city: string, query = '') {
    if (!stateCode.trim() || !city.trim()) return [];
    const params = new URLSearchParams({ state: stateCode.trim(), city: city.trim() });
    if (query.trim()) params.set('q', query.trim());
    const response = await apiRequest<{ suggestions: string[] }>(`/api/v1/locations/neighborhoods/?${params.toString()}`);
    return response.suggestions ?? [];
  },

  async search(query: string): Promise<Location[]> {
    const normalized = query.trim().toLocaleLowerCase('pt-BR');
    if (!normalized) return [];

    const results: Location[] = [];
    const seen = new Set<string>();
    const push = (state: (typeof brazilLocations)[number], city: string) => {
      const key = `${state.code}:${city}`;
      if (seen.has(key) || results.length >= 20) return;
      seen.add(key);
      results.push({ state: state.name, stateCode: state.code, city });
    };

    // Search the bundled high-frequency city fallback across every state first.
    // This keeps common global suggestions instant and avoids issuing many network
    // requests merely because the user has not selected a state yet.
    for (const state of brazilLocations) {
      const stateMatches = `${state.name} ${state.code}`.toLocaleLowerCase('pt-BR').includes(normalized);
      for (const city of state.cities) {
        if (stateMatches || `${city} ${state.name} ${state.code}`.toLocaleLowerCase('pt-BR').includes(normalized)) {
          push(state, city);
        }
      }
    }
    if (results.length >= 20) return results;

    // If the query identifies a state, enrich those suggestions from the complete
    // municipality catalog for that state. Smaller cities remain discoverable
    // without fetching all 27 state catalogs for every keystroke.
    const matchingStates = brazilLocations.filter((state) =>
      `${state.name} ${state.code}`.toLocaleLowerCase('pt-BR').includes(normalized),
    );
    for (const state of matchingStates.slice(0, 8)) {
      const cities = await fetchMunicipalities(state.code);
      for (const city of cities) {
        if (`${city} ${state.name} ${state.code}`.toLocaleLowerCase('pt-BR').includes(normalized)) {
          push(state, city);
          if (results.length >= 20) return results;
        }
      }
    }
    return results;
  },
};
