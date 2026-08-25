import { persistLocale } from '@/i18n/config';
import { graphqlRequest } from '@/lib/api-client';
import { LISTING_FIELDS } from '@/lib/graphql-fragments';
import {
  mapAccountProfile,
  mapAccountReview,
  mapListing,
  type ApiAccountProfile,
  type ApiListing,
  type ApiReview,
} from '@/lib/api-mappers';
import { uploadFile } from '@/services/upload.service';
import type {
  AccountOverview,
  AccountProfile,
  AccountReview,
  AccountSettings,
} from '@/types';

const ACCOUNT_PROFILE_FIELDS = `
  id
  name
  email
  phone
  avatarUrl
  bio
  location { countryCode state stateCode city district }
  emailVerified
  phoneVerified
  memberSince
`;

const ACCOUNT_SETTINGS_FIELDS = `
  language
  currency
  emailMessages
  emailListingUpdates
  emailRecommendations
  pushMessages
  pushListingUpdates
  marketingEmails
  showPhoneToSellers
  showOnlineStatus
`;

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

export const accountService = {
  async getOverview(): Promise<AccountOverview> {
    const data = await graphqlRequest<{ myAccountOverview: {
      savedCount?: number;
      unreadMessages?: number;
      reviewsCount?: number;
      recentlyViewed?: ApiListing[];
      savedListings?: ApiListing[];
    } }>(`
      query MyAccountOverview {
        myAccountOverview {
          savedCount
          unreadMessages
          reviewsCount
          recentlyViewed { ${LISTING_FIELDS} }
          savedListings { ${LISTING_FIELDS} }
        }
      }
    `);

    return {
      savedCount: Number(data.myAccountOverview.savedCount || 0),
      unreadMessages: Number(data.myAccountOverview.unreadMessages || 0),
      reviewsCount: Number(data.myAccountOverview.reviewsCount || 0),
      recentlyViewed: (data.myAccountOverview.recentlyViewed || []).map(mapListing),
      savedListings: (data.myAccountOverview.savedListings || []).map(mapListing),
    };
  },

  async getSaved() {
    const data = await graphqlRequest<{ mySavedListings: ApiListing[] }>(`
      query MySavedListings {
        mySavedListings { ${LISTING_FIELDS} }
      }
    `);
    return (data.mySavedListings || []).map(mapListing);
  },

  async getProfile(): Promise<AccountProfile> {
    const data = await graphqlRequest<{ me: ApiAccountProfile }>(`
      query MyProfile {
        me { ${ACCOUNT_PROFILE_FIELDS} }
      }
    `);
    return mapAccountProfile(data.me);
  },

  async updateProfile(input: Partial<AccountProfile>): Promise<AccountProfile> {
    const variables = {
      input: {
        ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
        ...(input.email !== undefined ? { email: input.email } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.bio !== undefined ? { bio: input.bio } : {}),
        ...(input.location
          ? {
              countryCode: input.location.countryCode,
              state: input.location.state,
              stateCode: input.location.stateCode,
              city: input.location.city,
              district: input.location.district || null,
            }
          : {}),
      },
    };
    const data = await graphqlRequest<{ updateMyProfile: ApiAccountProfile }>(`
      mutation UpdateMyProfile($input: AccountProfileInput!) {
        updateMyProfile(input: $input) { ${ACCOUNT_PROFILE_FIELDS} }
      }
    `, variables);
    return mapAccountProfile(data.updateMyProfile);
  },

  async updateAvatar(file: File): Promise<AccountProfile> {
    const avatarUploadId = await uploadFile(file, 'avatar');
    const data = await graphqlRequest<{ updateMyProfile: ApiAccountProfile }>(`
      mutation UpdateMyAvatar($input: AccountProfileInput!) {
        updateMyProfile(input: $input) { ${ACCOUNT_PROFILE_FIELDS} }
      }
    `, { input: { avatarUploadId } });
    return mapAccountProfile(data.updateMyProfile);
  },

  async getSettings(): Promise<AccountSettings> {
    const data = await graphqlRequest<{ myAccountSettings: AccountSettings }>(`
      query MyAccountSettings {
        myAccountSettings { ${ACCOUNT_SETTINGS_FIELDS} }
      }
    `);
    return data.myAccountSettings;
  },

  async updateSettings(input: Partial<AccountSettings>): Promise<AccountSettings> {
    const settingsInput = { ...input };
    delete settingsInput.currency;
    const data = await graphqlRequest<{ updateMyAccountSettings: AccountSettings }>(`
      mutation UpdateMyAccountSettings($input: AccountSettingsInput!) {
        updateMyAccountSettings(input: $input) { ${ACCOUNT_SETTINGS_FIELDS} }
      }
    `, { input: settingsInput });

    if (input.language) persistLocale(input.language);
    return data.updateMyAccountSettings;
  },

  async getMyReviews(): Promise<AccountReview[]> {
    const data = await graphqlRequest<{ myReviews: ApiReview[] }>(`
      query MyReviews {
        myReviews { ${REVIEW_FIELDS} }
      }
    `);
    return (data.myReviews || []).map(mapAccountReview);
  },

  async deleteReview(id: string) {
    const data = await graphqlRequest<{ deleteMyReview: boolean }>(`
      mutation DeleteMyReview($id: ID!) {
        deleteMyReview(reviewId: $id)
      }
    `, { id });
    return { success: data.deleteMyReview };
  },
};
