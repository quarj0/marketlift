import { apiRequest, graphqlRequest } from "@/lib/api-client";
import { mapListing, type ApiListing, type ApiSeller } from "@/lib/api-mappers";
import { LISTING_FIELDS } from "@/lib/graphql-fragments";
import type { Location, SearchFilters } from "@/types";

function paramsFromFilters(filters: SearchFilters, pageSize = 24) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.countryCode) params.set("countryCode", filters.countryCode);
  if (filters.category) params.set("category", filters.category);
  const hasCoordinates =
    Number.isFinite(filters.latitude) && Number.isFinite(filters.longitude);
  if (!hasCoordinates) {
    if (filters.region) params.set("region", filters.region);
    if (filters.state) params.set("state", filters.state);
    if (filters.city) params.set("city", filters.city);
    if (filters.district) params.set("district", filters.district);
  }
  if (filters.latitude !== undefined)
    params.set("latitude", String(filters.latitude));
  if (filters.longitude !== undefined)
    params.set("longitude", String(filters.longitude));
  if (filters.radiusKm !== undefined)
    params.set("radiusKm", String(filters.radiusKm));
  if (filters.minPrice !== undefined)
    params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined)
    params.set("maxPrice", String(filters.maxPrice));
  Object.entries(filters.attributes ?? {}).forEach(([key, value]) => {
    if (typeof value === "object") {
      if (value.min !== undefined)
        params.set(`attr.${key}.min`, String(value.min));
      if (value.max !== undefined)
        params.set(`attr.${key}.max`, String(value.max));
      return;
    }
    if (value !== "") params.set(`attr.${key}`, String(value));
  });
  if (filters.condition) params.set("condition", filters.condition);
  if (filters.sellerType) params.set("sellerType", filters.sellerType);
  if (filters.verifiedOnly) params.set("verifiedOnly", "true");
  if (filters.dateListed) params.set("dateListed", filters.dateListed);
  if (filters.sort) params.set("sort", filters.sort);
  params.set("pageSize", String(Math.max(1, Math.min(pageSize, 50))));
  return params;
}

type SearchListingSeller = Pick<ApiSeller, "id" | "name"> & {
  type?: string;
  verified?: boolean;
};

type SearchListingRow = Omit<
  ApiListing,
  "seller" | "status" | "categorySchemaVersion"
> & {
  sellerId?: string;
  seller?: SearchListingSeller | null;
  categorySchemaVersion?: number;
};

type SearchResponse = {
  results?: SearchListingRow[];
  items?: SearchListingRow[];
  count?: number;
  totalCount?: number;
};

function normalizeSearchListing(row: SearchListingRow): ApiListing {
  return {
    ...row,
    seller: {
      id: String(row.seller?.id || row.sellerId || ""),
      name: row.seller?.name || "Seller",
      verified: Boolean(row.seller?.verified),
      sellerType: row.seller?.type || "individual",
      rating: 0,
      reviews: 0,
      activeListings: 0,
      memberSince: row.createdAt,
      responseRate: 0,
      location: row.location,
    },
    status: "published",
    categorySchemaVersion: row.categorySchemaVersion || 1,
    attributes: row.attributes || {},
  };
}

async function fetchListings(filters: SearchFilters = {}, pageSize = 24) {
  const params = paramsFromFilters(filters, pageSize);
  const data = await apiRequest<SearchResponse>(
    `/api/v1/search/listings/?${params.toString()}`,
  );
  const rows = data.results ?? data.items ?? [];
  return rows.map((row) => mapListing(normalizeSearchListing(row)));
}

export const listingService = {
  getListings: (filters: SearchFilters = {}) => fetchListings(filters, 50),

  async getListing(slug: string) {
    const data = await graphqlRequest<{ listing: ApiListing | null }>(
      `query Listing($id: String!) { listing(id: $id) { ${LISTING_FIELDS} } }`,
      { id: slug },
    );
    return data.listing ? mapListing(data.listing) : null;
  },

  async getSimilar(slug: string, limit = 4) {
    const data = await graphqlRequest<{ similarListings: ApiListing[] }>(
      `query SimilarListings($id: String!, $limit: Int!) { similarListings(listingId: $id, limit: $limit) { ${LISTING_FIELDS} } }`,
      { id: slug, limit },
    );
    return data.similarListings.map(mapListing);
  },

  async getFeatured(limit = 8, countryCode?: string) {
    const data = await graphqlRequest<{ featuredListings: ApiListing[] }>(
      `query FeaturedListings($limit: Int!, $countryCode: String) {
        featuredListings(limit: $limit, countryCode: $countryCode) { ${LISTING_FIELDS} }
      }`,
      { limit, countryCode: countryCode || null },
    );
    return data.featuredListings.map(mapListing);
  },

  async getRecent(limit = 8, countryCode?: string) {
    const data = await graphqlRequest<{ recentListings: ApiListing[] }>(
      `query RecentListings($limit: Int!, $countryCode: String) {
        recentListings(limit: $limit, countryCode: $countryCode) { ${LISTING_FIELDS} }
      }`,
      { limit, countryCode: countryCode || null },
    );
    return data.recentListings.map(mapListing);
  },

  async getNearby(location: Location, limit = 8) {
    const hasCoordinates =
      Number.isFinite(location.latitude) && Number.isFinite(location.longitude);
    const listings = await fetchListings(
      hasCoordinates
        ? {
            countryCode: location.countryCode,
            latitude: location.latitude,
            longitude: location.longitude,
            radiusKm: 25,
            sort: "distance",
          }
        : {
            countryCode: location.countryCode,
            state: location.stateCode,
            city: location.city,
            district: location.district,
            sort: "newest",
          },
      Math.max(1, Math.min(limit, 50)),
    );
    return listings.slice(0, Math.max(1, limit));
  },
};
