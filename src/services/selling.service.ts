import { listings } from '@/mocks/data';
import { paymentService, sellerPlans } from '@/services/payment.service';
import type {
  ListingAttributes,
  ListingCondition,
  Location,
  SellerListing,
  SellingDashboardData,
} from '@/types';

const delay = (ms = 320) => new Promise((resolve) => setTimeout(resolve, ms));

export interface CreateListingInput {
  title: string;
  description: string;
  price: number;
  category: string;
  condition?: ListingCondition;
  negotiable: boolean;
  location: Location;
  images: string[];
  specifications?: Record<string, string | number>;
  attributes?: ListingAttributes;
  categorySchemaVersion?: number;
}

let sellingListings: SellerListing[] = listings.slice(0, 6).map((listing, index) => ({
  ...listing,
  status:
    index === 1
      ? 'draft'
      : index === 4
        ? 'paused'
        : index === 5
          ? 'under_review'
          : 'published',
  inquiries: [18, 0, 9, 6, 3, 2][index],
  favorites: [41, 0, 22, 13, 7, 4][index],
}));

export const sellingService = {
  async getDashboard(): Promise<SellingDashboardData> {
    await delay();
    const subscription = await paymentService.getSubscription();
    const plan =
      sellerPlans.find((item) => item.id === subscription.planId) ?? sellerPlans[0];
    const active = sellingListings.filter((item) => item.status === 'published').length;
    const drafts = sellingListings.filter((item) => item.status === 'draft').length;
    const underReview = sellingListings.filter(
      (item) => item.status === 'under_review',
    ).length;

    return {
      active,
      drafts,
      underReview,
      views: 8420,
      messages: 27,
      plan: { name: plan.name, used: active, limit: plan.listingLimit },
      recentListings: sellingListings.slice(0, 4),
    };
  },

  async getListings() {
    await delay();
    return [...sellingListings];
  },

  async setStatus(id: string, status: SellerListing['status']) {
    await delay(240);
    sellingListings = sellingListings.map((listing) =>
      listing.id === id ? { ...listing, status } : listing,
    );
    return sellingListings.find((listing) => listing.id === id)!;
  },

  async deleteListing(id: string) {
    await delay(260);
    sellingListings = sellingListings.filter((listing) => listing.id !== id);
    return { success: true };
  },

  async createListing(input: CreateListingInput) {
    await delay(500);

    const created: SellerListing = {
      id: `mock-${Date.now()}`,
      slug: `${input.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')}-${Date.now()}`,
      title: input.title,
      description: input.description,
      price: input.price,
      category: input.category,
      condition: input.condition,
      location: input.location,
      images: input.images.length ? input.images : ['/icons/icon-512.svg'],
      sellerId: 'seller-1',
      createdAt: new Date().toISOString(),
      views: 0,
      negotiable: input.negotiable,
      specifications: input.specifications,
      attributes: input.attributes,
      categorySchemaVersion: input.categorySchemaVersion,
      status: 'published',
      inquiries: 0,
      favorites: 0,
    };

    sellingListings.unshift(created);
    return created;
  },
};
