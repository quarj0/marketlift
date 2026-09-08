import { graphqlRequest } from "@/lib/api-client";

export type SavedSearchAlert = {
  id: string;
  name: string;
  criteria: Record<string, unknown>;
  alertsEnabled: boolean;
  active: boolean;
  createdAt: string;
  lastCheckedAt?: string | null;
  lastNotifiedAt?: string | null;
};

const FIELDS = `
  id
  name
  criteria
  alertsEnabled
  active
  createdAt
  lastCheckedAt
  lastNotifiedAt
`;

const PARAM_ALIASES: Record<string, string> = {
  country_code: "countryCode",
  radius_km: "radiusKm",
  min_price: "minPrice",
  max_price: "maxPrice",
  seller_type: "sellerType",
  verified_only: "verified",
  date_listed: "date",
};

export const savedSearchService = {
  async getAll() {
    const data = await graphqlRequest<{ mySavedSearches: SavedSearchAlert[] }>(
      `query MySavedSearches { mySavedSearches { ${FIELDS} } }`,
    );
    return data.mySavedSearches ?? [];
  },

  async create(input: {
    name: string;
    criteria: Record<string, unknown>;
    alertsEnabled?: boolean;
  }) {
    const data = await graphqlRequest<{ saveSearch: SavedSearchAlert }>(
      `mutation SaveSearch($input: SavedSearchInput!) {
        saveSearch(input: $input) { ${FIELDS} }
      }`,
      {
        input: {
          name: input.name,
          criteria: input.criteria,
          alertsEnabled: input.alertsEnabled ?? true,
        },
      },
    );
    return data.saveSearch;
  },

  async setAlerts(id: string, enabled: boolean) {
    const data = await graphqlRequest<{
      updateSavedSearchAlerts: SavedSearchAlert;
    }>(
      `mutation UpdateSavedSearchAlerts($id: ID!, $enabled: Boolean!) {
        updateSavedSearchAlerts(id: $id, enabled: $enabled) { ${FIELDS} }
      }`,
      { id, enabled },
    );
    return data.updateSavedSearchAlerts;
  },

  async remove(id: string) {
    const data = await graphqlRequest<{ deleteSavedSearch: boolean }>(
      `mutation DeleteSavedSearch($id: ID!) {
        deleteSavedSearch(id: $id)
      }`,
      { id },
    );
    return data.deleteSavedSearch;
  },

  toSearchHref(criteria: Record<string, unknown>) {
    const params = new URLSearchParams();
    Object.entries(criteria || {}).forEach(([key, raw]) => {
      if (raw === null || raw === undefined || raw === "") return;
      if (typeof raw === "object") return;
      const param = PARAM_ALIASES[key] ?? key;
      if (key === "verified_only" || key === "verifiedOnly") {
        if (Boolean(raw)) params.set("verified", "1");
        return;
      }
      params.set(param, String(raw));
    });
    return `/search${params.size ? `?${params.toString()}` : ""}`;
  },
};
