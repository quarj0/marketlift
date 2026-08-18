import { brazilLocations } from "@/mocks/data";
import type { Location } from "@/types";

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export const locationService = {
  async getStates() {
    await delay();
    return brazilLocations.map(({ code, name }) => ({ code, name }));
  },
  async getCities(stateCode: string) {
    await delay();
    return (
      brazilLocations.find((state) => state.code === stateCode)?.cities ?? []
    );
  },
  async search(query: string): Promise<Location[]> {
    await delay();
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return brazilLocations.flatMap((state) =>
      state.cities
        .filter((city) =>
          `${city} ${state.name} ${state.code}`
            .toLowerCase()
            .includes(normalized),
        )
        .map((city) => ({ state: state.name, stateCode: state.code, city })),
    );
  },
};
