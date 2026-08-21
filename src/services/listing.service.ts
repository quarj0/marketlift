import { apiRequest, graphqlRequest } from '@/lib/api-client';
import { mapListing } from '@/lib/api-mappers';
import { LISTING_FIELDS } from '@/lib/graphql-fragments';
import type { SearchFilters } from '@/types';

function paramsFromFilters(filters: SearchFilters) {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.category) params.set('category', filters.category);
  if (filters.region) params.set('region', filters.region);
  if (filters.state) params.set('state', filters.state);
  if (filters.city) params.set('city', filters.city);
  if (filters.district) params.set('district', filters.district);
  if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
  if (filters.condition) params.set('condition', filters.condition);
  if (filters.sellerType) params.set('sellerType', filters.sellerType);
  if (filters.verifiedOnly) params.set('verifiedOnly', 'true');
  if (filters.dateListed) params.set('dateListed', filters.dateListed);
  if (filters.sort) params.set('sort', filters.sort);
  params.set('pageSize', '50');
  return params;
}

type SearchResponse = { results?: any[]; items?: any[]; count?: number; totalCount?: number };

export const listingService = {
  async getListings(filters: SearchFilters = {}) {
    const params = paramsFromFilters(filters);
    const data = await apiRequest<SearchResponse>(`/api/v1/search/listings/?${params.toString()}`);
    const rows = data.results ?? data.items ?? [];
    return rows.map((row: any) => mapListing({
      ...row,
      seller: row.seller || { id: row.sellerId, name: 'Seller', verified: false, sellerType: 'individual', rating: 0, reviews: 0, activeListings: 0, memberSince: row.createdAt, responseRate: 0, location: row.location },
      status: 'published',
      categorySchemaVersion: row.categorySchemaVersion || 1,
      attributes: row.attributes || {},
    }));
  },

  async getListing(slug: string) {
    const data = await graphqlRequest<{ listing: any | null }>(
      `query Listing($id: String!) { listing(id: $id) { ${LISTING_FIELDS} } }`,
      { id: slug },
    );
    return data.listing ? mapListing(data.listing) : null;
  },

  async getSimilar(slug: string, limit = 4) {
    const data = await graphqlRequest<{ similarListings: any[] }>(
      `query SimilarListings($id: String!, $limit: Int!) { similarListings(listingId: $id, limit: $limit) { ${LISTING_FIELDS} } }`,
      { id: slug, limit },
    );
    return data.similarListings.map(mapListing);
  },

  async getFeatured(limit = 8) {
    const data = await graphqlRequest<{ featuredListings: any[] }>(
      `query FeaturedListings($limit: Int!) { featuredListings(limit: $limit) { ${LISTING_FIELDS} } }`,
      { limit },
    );
    return data.featuredListings.map(mapListing);
  },

  async getRecent(limit = 8) {
    const data = await graphqlRequest<{ recentListings: any[] }>(
      `query RecentListings($limit: Int!) { recentListings(limit: $limit) { ${LISTING_FIELDS} } }`,
      { limit },
    );
    return data.recentListings.map(mapListing);
  },

  async getNearby(stateCode = 'SP', limit = 8) {
    const data = await graphqlRequest<{ nearbyListings: any[] }>(
      `query NearbyListings($stateCode: String!, $limit: Int!) { nearbyListings(stateCode: $stateCode, limit: $limit) { ${LISTING_FIELDS} } }`,
      { stateCode, limit },
    );
    return data.nearbyListings.map(mapListing);
  },
};
