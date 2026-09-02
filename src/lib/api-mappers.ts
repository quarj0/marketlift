import { resolveApiUrl } from "@/lib/api-client";
import type {
  AccountProfile,
  AccountReview,
  CategoryConfiguration,
  Conversation,
  Listing,
  Message,
  NotificationItem,
  Payment,
  PromotionOption,
  Review,
  Seller,
  SellerListing,
  SellerPlan,
  User,
  VerificationSubmission,
} from "@/types";

const LISTING_IMAGE_PLACEHOLDER = "/images/listing-placeholder.svg";
const AVATAR_PLACEHOLDER = "/images/avatar-placeholder.svg";

function mapMediaUrls(
  urls: Array<string | null | undefined> | null | undefined,
) {
  const mapped = (urls || [])
    .filter(
      (url): url is string => typeof url === "string" && url.trim().length > 0,
    )
    .map((url) => resolveApiUrl(url.trim()));
  return mapped.length ? mapped : [LISTING_IMAGE_PLACEHOLDER];
}

export type ApiLocation = {
  countryCode?: string | null;
  state: string;
  stateCode: string;
  city: string;
  district?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type ApiUser = {
  id: string;
  name: string;
  email?: string;
  phone?: string | null;
  countryCode?: string | null;
  sellerProfile?: {
    sellerId: string;
    activatedAt: string;
    verified: boolean;
  } | null;
};

export type ApiCategoryField = {
  id: string;
  label: string;
  type: CategoryConfiguration["fields"][number]["type"];
  required?: boolean;
  filterable?: boolean;
  allowCustomValue?: boolean;
  placeholder?: string | null;
  helpText?: string | null;
  unit?: string | null;
  min?: number | null;
  max?: number | null;
  step?: number | null;
  options?: CategoryConfiguration["fields"][number]["options"];
};

export type ApiCategory = {
  id: string;
  name: string;
  icon?: string | null;
  active?: boolean | null;
  subcategories?: Array<{
    id: string;
    name: string;
    icon?: string | null;
    active?: boolean | null;
  }> | null;
  schemaVersion?: number | null;
  description?: string | null;
  pricing?: {
    mode?: string | null;
    label?: string | null;
    placeholder?: string | null;
  } | null;
  condition?: { enabled?: boolean | null; required?: boolean | null } | null;
  fields?: ApiCategoryField[] | null;
};

export type ApiAccountProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  location?: ApiLocation | null;
  memberSince: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
};

export type ApiReview = {
  id: string;
  sellerId: string;
  sellerName?: string;
  sellerAvatar?: string | null;
  reviewerName: string;
  listingTitle?: string | null;
  rating: number;
  comment?: string | null;
  date: string;
  sellerReply?: string | null;
};

export type ApiNotification = {
  id: string;
  type: NotificationItem["type"];
  title: string;
  body: string;
  createdAt: string;
  read?: boolean;
  href?: string | null;
};

export type ApiConversation = {
  id: string;
  participant: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    verifiedSeller?: boolean;
    isSeller?: boolean;
  };
  listing?: {
    id?: string | null;
    slug?: string | null;
    title: string;
    price?: number | null;
    primaryImage?: string | null;
    deleted?: boolean;
  } | null;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unread?: number;
};

export type ApiMessage = {
  id: string;
  conversationId: string;
  sender?: string;
  text?: string | null;
  createdAt: string;
  read?: boolean;
  attachment?: {
    url: string;
    name: string;
    mimeType: string;
    size?: number;
  } | null;
};

export type ApiVerification = {
  id: string;
  identityCountryCode?: string | null;
  identityType?: string | null;
  identityMasked?: string | null;
  cpfMasked?: string | null;
  legalName: string;
  birthDate: string;
  status: string;
  submittedAt: string;
  providerResult?: string | null;
  riskFlags?: string[] | null;
};

export type ApiSellerPlan = {
  id: string;
  name: string;
  countryCode?: string;
  currency?: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  listingLimit?: number;
  promotionCredits?: number;
  features?: string[];
  visibilityWeight?: number;
  recommended?: boolean;
};

export type ApiPromotion = {
  id: PromotionOption["id"];
  name: string;
  description: string;
  countryCode?: string;
  currency?: string;
  durationDays?: number;
  price?: number;
};

export type ApiPayment = {
  id: string;
  purpose: Payment["purpose"];
  amount?: number;
  currency?: string | null;
  provider?: string | null;
  method: Payment["method"];
  status: Payment["status"] | "refunded";
  createdAt: string;
  reference: string;
  checkoutData?: Record<string, string> | null;
  planId?: string | null;
  billingCycle?: Payment["billingCycle"] | null;
  listingId?: string | null;
  promotionId?: string | null;
};

export type ApiSeller = {
  id: string;
  countryCode?: string | null;
  name: string;
  avatarUrl?: string | null;
  phone?: string | null;
  verified: boolean;
  sellerType: "individual" | "business" | string;
  isSuspended?: boolean;
  rating: number;
  reviews: number;
  responseRate?: number | null;
  activeListings: number;
  memberSince: string;
  location: ApiLocation;
};

export type ApiListing = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price?: number | null;
  category: string;
  categoryName?: string;
  categorySchemaVersion?: number;
  condition?: string | null;
  location: ApiLocation;
  images: string[];
  seller: ApiSeller;
  createdAt: string;
  status: string;
  views: number;
  negotiable: boolean;
  attributes?: Record<string, string | number | boolean> | null;
  featured?: boolean;
  urgent?: boolean;
  favorites?: number;
  inquiries?: number;
};

export function mapUser(raw: ApiUser): User {
  return {
    id: String(raw.id),
    countryCode: raw.countryCode || undefined,
    name: raw.name,
    email: raw.email,
    phone: raw.phone ?? undefined,
    sellerProfile: raw.sellerProfile
      ? {
          sellerId: String(raw.sellerProfile.sellerId),
          activatedAt: raw.sellerProfile.activatedAt,
          verified: Boolean(raw.sellerProfile.verified),
        }
      : undefined,
  };
}

export function mapSeller(raw: ApiSeller): Seller {
  return {
    id: String(raw.id),
    countryCode: raw.countryCode || raw.location?.countryCode || undefined,
    name: raw.name,
    avatar: raw.avatarUrl?.trim()
      ? resolveApiUrl(raw.avatarUrl.trim())
      : AVATAR_PLACEHOLDER,
    phone: raw.phone?.trim() || undefined,
    verified: Boolean(raw.verified),
    type: raw.sellerType === "business" ? "business" : "individual",
    rating: Number(raw.rating || 0),
    reviews: Number(raw.reviews || 0),
    activeListings: Number(raw.activeListings || 0),
    memberSince: raw.memberSince,
    responseRate: Number(raw.responseRate || 0),
    location: {
      countryCode: raw.location?.countryCode || undefined,
      state: raw.location?.state || "",
      stateCode: raw.location?.stateCode || "",
      city: raw.location?.city || "",
      district: raw.location?.district || undefined,
    },
  };
}

export function mapListing(raw: ApiListing): Listing {
  return {
    id: String(raw.id),
    slug: raw.slug,
    title: raw.title,
    description: raw.description || "",
    price: Number(raw.price ?? 0),
    category: raw.category,
    condition: (raw.condition || undefined) as Listing["condition"],
    location: {
      countryCode: raw.location?.countryCode || undefined,
      state: raw.location?.state || "",
      stateCode: raw.location?.stateCode || "",
      city: raw.location?.city || "",
      district: raw.location?.district || undefined,
    },
    images: mapMediaUrls(raw.images),
    sellerId: String(raw.seller?.id || ""),
    sellerVerified: Boolean(raw.seller?.verified),
    createdAt: raw.createdAt,
    views: Number(raw.views || 0),
    featured: Boolean(raw.featured),
    urgent: Boolean(raw.urgent),
    negotiable: Boolean(raw.negotiable),
    attributes: raw.attributes || undefined,
    specifications: raw.attributes
      ? Object.fromEntries(
          Object.entries(raw.attributes).filter(
            ([, value]) => typeof value !== "boolean",
          ) as Array<[string, string | number]>,
        )
      : undefined,
    categorySchemaVersion: raw.categorySchemaVersion,
  };
}

export function mapSellerListing(raw: ApiListing): SellerListing {
  return {
    ...mapListing(raw),
    status: raw.status as SellerListing["status"],
    inquiries: Number(raw.inquiries || 0),
    favorites: Number(raw.favorites || 0),
  };
}

export function mapCategory(raw: ApiCategory): CategoryConfiguration {
  return {
    id: raw.id,
    name: raw.name,
    icon: raw.icon || "Tag",
    schemaVersion: Number(raw.schemaVersion || 1),
    description: raw.description || "",
    active: raw.active !== false,
    subcategories: (raw.subcategories || [])
      .filter((sub) => sub.active !== false)
      .map((sub) => ({
        id: sub.id,
        name: sub.name,
        icon: sub.icon || "Tag",
        active: sub.active !== false,
        subcategories: [],
      })),
    pricing: {
      mode: raw.pricing?.mode === "optional" ? "optional" : "required",
      label: raw.pricing?.label || "Price",
      placeholder: raw.pricing?.placeholder || undefined,
    },
    condition: {
      enabled: raw.condition?.enabled !== false,
      required: Boolean(raw.condition?.required),
    },
    fields: (raw.fields || []).map((field) => ({
      id: field.id,
      label: field.label,
      type: field.type,
      required: Boolean(field.required),
      filterable: Boolean(field.filterable),
      allowCustomValue: Boolean(field.allowCustomValue),
      placeholder: field.placeholder || undefined,
      helpText: field.helpText || undefined,
      unit: field.unit || undefined,
      min: field.min ?? undefined,
      max: field.max ?? undefined,
      step: field.step ?? undefined,
      options: field.options || [],
    })),
  };
}

export function mapAccountProfile(raw: ApiAccountProfile): AccountProfile {
  return {
    id: String(raw.id),
    fullName: raw.name,
    email: raw.email,
    phone: raw.phone || "",
    avatar: raw.avatarUrl ? resolveApiUrl(raw.avatarUrl) : undefined,
    bio: raw.bio || undefined,
    location: {
      countryCode: raw.location?.countryCode || undefined,
      state: raw.location?.state || "",
      stateCode: raw.location?.stateCode || "",
      city: raw.location?.city || "",
      district: raw.location?.district || undefined,
    },
    memberSince: raw.memberSince,
    emailVerified: Boolean(raw.emailVerified),
    phoneVerified: Boolean(raw.phoneVerified),
  };
}

export function mapReview(raw: ApiReview): Review {
  return {
    id: String(raw.id),
    sellerId: String(raw.sellerId),
    reviewerName: raw.reviewerName,
    rating: Number(raw.rating),
    comment: raw.comment || "",
    date: raw.date,
    sellerReply: raw.sellerReply || undefined,
  };
}

export function mapAccountReview(raw: ApiReview): AccountReview {
  return {
    ...mapReview(raw),
    sellerName: raw.sellerName || "",
    sellerAvatar: raw.sellerAvatar || undefined,
    listingTitle: raw.listingTitle || undefined,
  };
}

export function mapNotification(raw: ApiNotification): NotificationItem {
  return {
    id: String(raw.id),
    type: raw.type,
    title: raw.title,
    body: raw.body,
    createdAt: raw.createdAt,
    read: Boolean(raw.read),
    href: raw.href || undefined,
  };
}

export function mapConversation(raw: ApiConversation): Conversation {
  return {
    id: String(raw.id),
    participant: {
      id: String(raw.participant.id),
      name: raw.participant.name,
      avatar: raw.participant.avatarUrl?.trim()
        ? resolveApiUrl(raw.participant.avatarUrl.trim())
        : AVATAR_PLACEHOLDER,
      verified: Boolean(raw.participant.verifiedSeller),
      type: raw.participant.isSeller ? "business" : "individual",
      rating: 0,
      reviews: 0,
      activeListings: 0,
      memberSince: "",
      responseRate: 0,
      location: { state: "", stateCode: "", city: "" },
    },
    listing:
      raw.listing && !raw.listing.deleted && raw.listing.id && raw.listing.slug
        ? {
            id: String(raw.listing.id),
            slug: raw.listing.slug,
            title: raw.listing.title,
            description: "",
            price: Number(raw.listing.price ?? 0),
            category: "",
            location: { state: "", stateCode: "", city: "" },
            images: mapMediaUrls([raw.listing.primaryImage]),
            sellerId: "",
            createdAt: raw.lastMessageAt || new Date(0).toISOString(),
            views: 0,
          }
        : undefined,
    lastMessage: raw.lastMessage || "",
    lastMessageAt: raw.lastMessageAt || "",
    unread: Number(raw.unread || 0),
  };
}

export function mapMessage(raw: ApiMessage): Message {
  return {
    id: String(raw.id),
    conversationId: String(raw.conversationId),
    sender: raw.sender === "me" ? "me" : "seller",
    text: raw.text || "",
    createdAt: raw.createdAt,
    read: Boolean(raw.read),
    attachment: raw.attachment
      ? {
          type: "image",
          url: resolveApiUrl(raw.attachment.url),
          name: raw.attachment.name,
          mimeType: raw.attachment.mimeType,
          size: Number(raw.attachment.size || 0),
        }
      : undefined,
  };
}

export function mapVerification(raw: ApiVerification): VerificationSubmission {
  return {
    id: String(raw.id),
    countryCode: raw.identityCountryCode || undefined,
    identityType: raw.identityType || undefined,
    identityMasked: raw.identityMasked || raw.cpfMasked || "",
    cpfMasked: raw.cpfMasked || undefined,
    fullName: raw.legalName,
    birthDate: raw.birthDate,
    status:
      raw.status === "verified"
        ? "verified"
        : raw.status === "rejected"
          ? "rejected"
          : "pending",
    submittedAt: raw.submittedAt,
    providerResult: raw.providerResult || undefined,
    riskFlags: raw.riskFlags || [],
  };
}

export function mapPlan(raw: ApiSellerPlan): SellerPlan {
  return {
    id: raw.id,
    name: raw.name,
    countryCode: raw.countryCode || undefined,
    currency: raw.currency || undefined,
    monthlyPrice: Number(raw.monthlyPrice || 0),
    yearlyPrice: Number(raw.yearlyPrice || 0),
    listingLimit: Number(raw.listingLimit || 0),
    promotionCredits: Number(raw.promotionCredits || 0),
    features: raw.features || [],
    visibilityWeight: Number(raw.visibilityWeight || 1),
    recommended: Boolean(raw.recommended),
  };
}

export function mapPromotion(raw: ApiPromotion): PromotionOption {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    countryCode: raw.countryCode || undefined,
    currency: raw.currency || undefined,
    durationDays: Number(raw.durationDays || 0),
    price: Number(raw.price || 0),
  };
}

export function mapPayment(raw: ApiPayment): Payment {
  return {
    id: String(raw.id),
    purpose: raw.purpose,
    amount: Number(raw.amount || 0),
    currency: raw.currency || undefined,
    provider: raw.provider || undefined,
    method: raw.method,
    status: raw.status === "refunded" ? "cancelled" : raw.status,
    createdAt: raw.createdAt,
    reference: raw.reference,
    checkoutData: raw.checkoutData || {},
    planId: raw.planId || undefined,
    billingCycle: raw.billingCycle || undefined,
    listingId: raw.listingId ? String(raw.listingId) : undefined,
    promotionId: raw.promotionId || undefined,
  };
}
