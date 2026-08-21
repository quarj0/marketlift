import { graphqlRequest } from '@/lib/api-client';
import { realtimeClient, RealtimeUnavailableError } from '@/lib/realtime-client';
import { LISTING_FIELDS, SELLER_FIELDS } from '@/lib/graphql-fragments';
import {
  mapListing,
  mapNotification,
  mapReview,
  mapSeller,
  type ApiListing,
  type ApiNotification,
  type ApiReview,
  type ApiSeller,
} from '@/lib/api-mappers';
import type { MarketplaceReport, Review } from '@/types';

const REVIEW_FIELDS = `
  id sellerId sellerName sellerAvatar reviewerId reviewerName
  listingId listingTitle rating comment date sellerReply
`;

const REPORT_FIELDS = `
  id reference targetType targetId targetLabel reason statement priority status
  reporterName assignedTo internalNote decisionReason createdAt decidedAt
`;

type ApiMarketplaceReport = {
  id: string;
  targetType: MarketplaceReport['targetType'];
  targetId: string;
  reporterName?: string | null;
  reason: MarketplaceReport['reason'];
  statement?: string | null;
  createdAt: string;
  status: string;
};

function mapReport(raw: ApiMarketplaceReport): MarketplaceReport {
  return {
    id: String(raw.id),
    targetType: raw.targetType,
    targetId: String(raw.targetId),
    reporter: raw.reporterName || '',
    reason: raw.reason,
    description: raw.statement || '',
    createdAt: raw.createdAt,
    status:
      raw.status === 'dismissed'
        ? 'dismissed'
        : raw.status === 'resolved'
          ? 'actioned'
          : 'open',
  };
}

export const socialService = {
  async getSaved() {
    const data = await graphqlRequest<{ mySavedListings: ApiListing[] }>(`
      query MySavedListings {
        mySavedListings { ${LISTING_FIELDS} }
      }
    `);
    return (data.mySavedListings || []).map(mapListing);
  },

  async getSavedIds() {
    const data = await graphqlRequest<{ mySavedListings: Array<{ id: string }> }>(`
      query MySavedListingIds { mySavedListings { id } }
    `);
    return (data.mySavedListings || []).map((listing) => String(listing.id));
  },

  async toggleSaved(id: string) {
    const savedIds = await this.getSavedIds();
    const isSaved = savedIds.includes(id);
    const data = await graphqlRequest<Record<'saveListing' | 'unsaveListing', boolean>>(`
      mutation ToggleSaved($id: ID!) {
        ${isSaved ? 'unsaveListing' : 'saveListing'}(listingId: $id)
      }
    `, { id });
    return isSaved ? !data.unsaveListing : Boolean(data.saveListing);
  },

  async toggleFollowSeller(id: string) {
    const current = await graphqlRequest<{ seller: { isFollowed: boolean } | null }>(`
      query SellerFollowState($id: ID!) { seller(id: $id) { isFollowed } }
    `, { id });
    const isFollowed = Boolean(current.seller?.isFollowed);
    const data = await graphqlRequest<Record<'followSeller' | 'unfollowSeller', { isFollowed: boolean }>>(`
      mutation ToggleSellerFollow($id: ID!) {
        ${isFollowed ? 'unfollowSeller' : 'followSeller'}(sellerId: $id) { isFollowed }
      }
    `, { id });
    return isFollowed ? Boolean(data.unfollowSeller?.isFollowed) : Boolean(data.followSeller?.isFollowed);
  },

  async getSellerProfile(id: string) {
    const data = await graphqlRequest<{
      seller: ApiSeller | null;
      listings: ApiListing[];
      sellerReviews: ApiReview[];
    }>(`
      query SellerProfile($id: ID!, $sellerId: ID!) {
        seller(id: $id) { ${SELLER_FIELDS} }
        listings(filters: { sellerId: $sellerId }, limit: 100) { ${LISTING_FIELDS} }
        sellerReviews(sellerId: $id, limit: 100) { ${REVIEW_FIELDS} }
      }
    `, { id, sellerId: id });

    if (!data.seller) return null;
    return {
      seller: mapSeller(data.seller),
      listings: (data.listings || []).map(mapListing),
      reviews: (data.sellerReviews || []).map(mapReview),
    };
  },

  async getReviews(sellerId: string) {
    const data = await graphqlRequest<{ sellerReviews: ApiReview[] }>(`
      query SellerReviews($sellerId: ID!) {
        sellerReviews(sellerId: $sellerId, limit: 100) { ${REVIEW_FIELDS} }
      }
    `, { sellerId });
    return (data.sellerReviews || []).map(mapReview);
  },

  async addReview(input: Omit<Review, 'id' | 'date'>) {
    const data = await graphqlRequest<{ createReview: ApiReview }>(`
      mutation CreateReview($input: CreateReviewInput!) {
        createReview(input: $input) { ${REVIEW_FIELDS} }
      }
    `, {
      input: {
        sellerId: input.sellerId,
        rating: input.rating,
        comment: input.comment,
      },
    });
    return mapReview(data.createReview);
  },

  async replyReview(id: string, reply: string) {
    const data = await graphqlRequest<{ replyToReview: ApiReview }>(`
      mutation ReplyToReview($id: ID!, $reply: String!) {
        replyToReview(reviewId: $id, reply: $reply) { ${REVIEW_FIELDS} }
      }
    `, { id, reply });
    return mapReview(data.replyToReview);
  },

  async getNotifications() {
    const data = await graphqlRequest<{ notifications: ApiNotification[] }>(`
      query Notifications {
        notifications(limit: 100) { id type title body createdAt read href data }
      }
    `);
    return (data.notifications || []).map(mapNotification);
  },

  async markRead(id: string) {
    try {
      await realtimeClient.command('notification.read', { notificationId: id });
      return true;
    } catch (error) {
      if (!(error instanceof RealtimeUnavailableError)) throw error;
    }

    const data = await graphqlRequest<{ markNotificationRead: boolean }>(`
      mutation MarkNotificationRead($id: ID!) {
        markNotificationRead(notificationId: $id)
      }
    `, { id });
    return data.markNotificationRead;
  },

  async markAllRead() {
    try {
      await realtimeClient.command('notification.read_all');
      return true;
    } catch (error) {
      if (!(error instanceof RealtimeUnavailableError)) throw error;
    }

    await graphqlRequest<{ markAllNotificationsRead: number }>(`
      mutation MarkAllNotificationsRead { markAllNotificationsRead }
    `);
    return true;
  },

  async report(input: Omit<MarketplaceReport, 'id' | 'createdAt' | 'status'>) {
    const data = await graphqlRequest<{ createReport: ApiMarketplaceReport }>(`
      mutation CreateReport($input: ReportInput!) {
        createReport(input: $input) { ${REPORT_FIELDS} }
      }
    `, {
      input: {
        targetType: input.targetType,
        targetId: input.targetId,
        reason: input.reason,
        statement: input.description,
      },
    });
    return mapReport(data.createReport);
  },

  async getReports() {
    const data = await graphqlRequest<{ myReports: ApiMarketplaceReport[] }>(`
      query MyReports { myReports(limit: 100) { ${REPORT_FIELDS} } }
    `);
    return (data.myReports || []).map(mapReport);
  },
};
