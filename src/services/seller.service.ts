import { graphqlRequest } from '@/lib/api-client';
import { mapReview, mapSeller, type ApiReview, type ApiSeller } from '@/lib/api-mappers';
import { SELLER_FIELDS } from '@/lib/graphql-fragments';
import type { Review, Seller, SellerType } from '@/types';

const REVIEW_FIELDS = `
  id
  sellerId
  sellerName
  sellerAvatar
  reviewerId
  reviewerName
  listingId
  listingTitle
  rating
  comment
  date
  sellerReply
`;

export type SellerReputation = {
  average: number;
  total: number;
  positivePercent: number;
  oneStar: number;
  twoStar: number;
  threeStar: number;
  fourStar: number;
  fiveStar: number;
};

export const sellerService = {
  async getSeller(id: string) {
    const data = await graphqlRequest<{ seller: ApiSeller | null }>(
      `query Seller($id: ID!) { seller(id: $id) { ${SELLER_FIELDS} } }`,
      { id },
    );
    return data.seller ? mapSeller(data.seller) : null;
  },

  async getSellers() {
    const data = await graphqlRequest<{ sellers: ApiSeller[] }>(`query Sellers { sellers(limit: 100) { ${SELLER_FIELDS} } }`);
    return data.sellers.map(mapSeller);
  },

  async getVerified(limit = 6) {
    const data = await graphqlRequest<{ verifiedSellers: ApiSeller[] }>(
      `query VerifiedSellers($limit: Int!) { verifiedSellers(limit: $limit) { ${SELLER_FIELDS} } }`,
      { limit },
    );
    return data.verifiedSellers.map(mapSeller);
  },

  async updateMyProfile(input: { displayName: string; sellerType: SellerType }): Promise<Seller> {
    const data = await graphqlRequest<{ updateMySellerProfile: ApiSeller }>(
      `mutation UpdateMySellerProfile($input: SellerProfileInput!) {
        updateMySellerProfile(input: $input) { ${SELLER_FIELDS} }
      }`,
      { input },
    );
    return mapSeller(data.updateMySellerProfile);
  },

  async getMyReviews(): Promise<Review[]> {
    const data = await graphqlRequest<{ mySellerReviews: ApiReview[] }>(`
      query MySellerReviews {
        mySellerReviews { ${REVIEW_FIELDS} }
      }
    `);
    return (data.mySellerReviews || []).map(mapReview);
  },

  async getMyReputation(sellerId: string): Promise<SellerReputation> {
    const data = await graphqlRequest<{ sellerReputation: Partial<SellerReputation> | null }>(`
      query MySellerReputation($sellerId: ID!) {
        sellerReputation(sellerId: $sellerId) {
          average
          total
          positivePercent
          oneStar
          twoStar
          threeStar
          fourStar
          fiveStar
        }
      }
    `, { sellerId });
    const raw = data.sellerReputation || {};
    return {
      average: Number(raw.average || 0),
      total: Number(raw.total || 0),
      positivePercent: Number(raw.positivePercent || 0),
      oneStar: Number(raw.oneStar || 0),
      twoStar: Number(raw.twoStar || 0),
      threeStar: Number(raw.threeStar || 0),
      fourStar: Number(raw.fourStar || 0),
      fiveStar: Number(raw.fiveStar || 0),
    };
  },

  async replyToReview(reviewId: string, reply: string): Promise<Review> {
    const data = await graphqlRequest<{ replyToReview: ApiReview }>(`
      mutation ReplyToReview($reviewId: ID!, $reply: String!) {
        replyToReview(reviewId: $reviewId, reply: $reply) { ${REVIEW_FIELDS} }
      }
    `, { reviewId, reply });
    return mapReview(data.replyToReview);
  },
};
