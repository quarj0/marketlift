import { graphqlRequest } from "@/lib/api-client";
import { mapSellerListing, type ApiListing } from "@/lib/api-mappers";
import { LISTING_FIELDS } from "@/lib/graphql-fragments";
import { uploadFile } from "@/services/upload.service";
import type {
  ListingAttributes,
  ListingCondition,
  Location,
  SellerListing,
  SellingDashboardData,
} from "@/types";

export interface CreateListingInput {
  title: string;
  description: string;
  price: number;
  category: string;
  condition?: ListingCondition;
  negotiable: boolean;
  location: Location;
  images: File[];
  specifications?: Record<string, string | number>;
  attributes?: ListingAttributes;
  categorySchemaVersion?: number;
}

const DASHBOARD_QUERY = `
  query SellingDashboard {
    mySellingDashboard {
      active drafts underReview views messages
      plan { name code used limit }
      recentListings { id title status views inquiries createdAt }
    }
    myListings { ${LISTING_FIELDS} }
  }
`;

type DashboardListingSummary = {
  id: string;
  title: string;
  status: string;
  views: number;
  inquiries: number;
  createdAt: string;
};

type DashboardPlan = {
  name: string;
  code: string;
  used: number;
  limit: number;
};

type DashboardSummary = {
  active: number;
  drafts: number;
  underReview: number;
  views: number;
  messages: number;
  plan: DashboardPlan | null;
  recentListings: DashboardListingSummary[];
};

type SellingDashboardResponse = {
  mySellingDashboard: DashboardSummary;
  myListings: ApiListing[];
};

export const sellingService = {
  async getDashboard(): Promise<SellingDashboardData> {
    const data = await graphqlRequest<SellingDashboardResponse>(DASHBOARD_QUERY);
    const listings = data.myListings.map(mapSellerListing);
    const recentIds = new Set(
      (data.mySellingDashboard.recentListings || []).map((item) =>
        String(item.id),
      ),
    );
    return {
      active: Number(data.mySellingDashboard.active || 0),
      drafts: Number(data.mySellingDashboard.drafts || 0),
      underReview: Number(data.mySellingDashboard.underReview || 0),
      views: Number(data.mySellingDashboard.views || 0),
      messages: Number(data.mySellingDashboard.messages || 0),
      plan: {
        name: data.mySellingDashboard.plan?.name || "Free",
        used: Number(data.mySellingDashboard.plan?.used || 0),
        limit: Number(data.mySellingDashboard.plan?.limit || 0),
      },
      recentListings: listings
        .filter((item) => recentIds.has(item.id))
        .slice(0, 5),
    };
  },

  async getListings() {
    const data = await graphqlRequest<{ myListings: ApiListing[] }>(
      `query MyListings { myListings { ${LISTING_FIELDS} } }`,
    );
    return data.myListings.map(mapSellerListing);
  },

  async getListing(id: string) {
    const listings = await this.getListings();
    return (
      listings.find((listing) => listing.id === id || listing.slug === id) ??
      null
    );
  },

  async updateListing(
    id: string,
    input: Omit<CreateListingInput, "images"> & { images?: File[] },
  ) {
    const imageUploadIds = input.images?.length
      ? await Promise.all(
          input.images.map((file) => uploadFile(file, "listing_image")),
        )
      : undefined;
    const payload: Record<string, unknown> = {
      categoryId: input.category,
      title: input.title,
      description: input.description,
      countryCode: input.location.countryCode,
      state: input.location.state,
      stateCode: input.location.stateCode,
      city: input.location.city,
      district: input.location.district || "",
      ...(Number.isFinite(input.location.latitude) &&
      Number.isFinite(input.location.longitude)
        ? {
            latitude: input.location.latitude,
            longitude: input.location.longitude,
          }
        : {}),
      price: input.price,
      condition: input.condition || "",
      negotiable: input.negotiable,
      attributes: input.attributes || input.specifications || {},
    };
    if (imageUploadIds) payload.imageUploadIds = imageUploadIds;

    const data = await graphqlRequest<{ updateListing: ApiListing }>(
      `mutation UpdateListing($id: ID!, $input: ListingInput!) {
        updateListing(listingId: $id, input: $input) { ${LISTING_FIELDS} }
      }`,
      { id, input: payload },
    );
    return mapSellerListing(data.updateListing);
  },

  async setStatus(id: string, status: SellerListing["status"]) {
    if (status === "published") {
      const data = await graphqlRequest<{ publishListing: ApiListing }>(
        `mutation PublishListing($id: ID!) { publishListing(listingId: $id) { ${LISTING_FIELDS} } }`,
        { id },
      );
      return mapSellerListing(data.publishListing);
    }
    if (status === "paused") {
      const data = await graphqlRequest<{ pauseListing: ApiListing }>(
        `mutation PauseListing($id: ID!) { pauseListing(listingId: $id) { ${LISTING_FIELDS} } }`,
        { id },
      );
      return mapSellerListing(data.pauseListing);
    }
    if (status === "sold") {
      const data = await graphqlRequest<{ markListingSold: ApiListing }>(
        `mutation MarkListingSold($id: ID!) { markListingSold(listingId: $id) { ${LISTING_FIELDS} } }`,
        { id },
      );
      return mapSellerListing(data.markListingSold);
    }
    throw new Error(`Unsupported listing status transition: ${status}`);
  },

  async deleteListing(id: string) {
    const data = await graphqlRequest<{ deleteMyListing: boolean }>(
      `mutation DeleteListing($id: ID!) { deleteMyListing(listingId: $id) }`,
      { id },
    );
    return { success: data.deleteMyListing };
  },

  async createListing(input: CreateListingInput) {
    const imageUploadIds = await Promise.all(
      input.images.map((file) => uploadFile(file, "listing_image")),
    );
    const data = await graphqlRequest<{
      createAndPublishListing: ApiListing;
    }>(
      `mutation CreateAndPublishListing($input: ListingInput!) {
        createAndPublishListing(input: $input) { ${LISTING_FIELDS} }
      }`,
      {
        input: {
          categoryId: input.category,
          title: input.title,
          description: input.description,
          countryCode: input.location.countryCode,
          state: input.location.state,
          stateCode: input.location.stateCode,
          city: input.location.city,
          district: input.location.district || "",
          ...(Number.isFinite(input.location.latitude) &&
          Number.isFinite(input.location.longitude)
            ? {
                latitude: input.location.latitude,
                longitude: input.location.longitude,
              }
            : {}),
          price: input.price,
          condition: input.condition || "",
          negotiable: input.negotiable,
          attributes: input.attributes || input.specifications || {},
          imageUploadIds,
        },
      },
    );

    return mapSellerListing(data.createAndPublishListing);
  },
};
