import { graphqlRequest } from "@/lib/api-client";
import {
  mapListing,
  mapSeller,
  type ApiListing,
  type ApiSeller,
} from "@/lib/api-mappers";
import {
  LISTING_FIELDS,
  SELLER_FIELDS,
} from "@/lib/graphql-fragments";
import { categoryService } from "@/services/category.service";

export const marketplaceService = {
  getCategories: categoryService.getCategories,

  async getHomeFeed(countryCode: string) {
    const data = await graphqlRequest<{
      featuredListings: ApiListing[];
      recentListings: ApiListing[];
      verifiedSellers: ApiSeller[];
    }>(
      `query MarketplaceHomeFeed(
        $countryCode: String!
        $featuredLimit: Int!
        $recentLimit: Int!
        $sellerLimit: Int!
      ) {
        featuredListings(limit: $featuredLimit, countryCode: $countryCode) {
          ${LISTING_FIELDS}
        }
        recentListings(limit: $recentLimit, countryCode: $countryCode) {
          ${LISTING_FIELDS}
        }
        verifiedSellers(limit: $sellerLimit, countryCode: $countryCode) {
          ${SELLER_FIELDS}
        }
      }`,
      {
        countryCode,
        featuredLimit: 8,
        recentLimit: 4,
        sellerLimit: 6,
      },
    );

    return {
      featuredListings: data.featuredListings.map(mapListing),
      recentListings: data.recentListings.map(mapListing),
      verifiedSellers: data.verifiedSellers.map(mapSeller),
    };
  },
};
