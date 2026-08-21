import { graphqlRequest } from '@/lib/api-client';
import { mapSeller } from '@/lib/api-mappers';
import { SELLER_FIELDS } from '@/lib/graphql-fragments';

export const sellerService = {
  async getSeller(id: string) {
    const data = await graphqlRequest<{ seller: any | null }>(
      `query Seller($id: ID!) { seller(id: $id) { ${SELLER_FIELDS} } }`,
      { id },
    );
    return data.seller ? mapSeller(data.seller) : null;
  },

  async getSellers() {
    const data = await graphqlRequest<{ sellers: any[] }>(`query Sellers { sellers(limit: 100) { ${SELLER_FIELDS} } }`);
    return data.sellers.map(mapSeller);
  },

  async getVerified(limit = 6) {
    const data = await graphqlRequest<{ verifiedSellers: any[] }>(
      `query VerifiedSellers($limit: Int!) { verifiedSellers(limit: $limit) { ${SELLER_FIELDS} } }`,
      { limit },
    );
    return data.verifiedSellers.map(mapSeller);
  },
};
