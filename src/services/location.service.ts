import { brazilLocations } from '@/data/brazil-locations';
import type { Location } from '@/types';

export const locationService = {
  async getStates() {
    return brazilLocations.map(({ code, name }) => ({ code, name }));
  },
  async getCities(stateCode: string) {
    return brazilLocations.find((state) => state.code === stateCode)?.cities ?? [];
  },
  async search(query: string): Promise<Location[]> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return brazilLocations.flatMap((state) =>
      state.cities
        .filter((city) => `${city} ${state.name} ${state.code}`.toLowerCase().includes(normalized))
        .map((city) => ({ state: state.name, stateCode: state.code, city })),
    );
  },
};
