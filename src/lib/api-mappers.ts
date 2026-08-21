import { resolveApiUrl } from '@/lib/api-client';
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
} from '@/types';

const LISTING_IMAGE_PLACEHOLDER = '/images/listing-placeholder.svg';
const AVATAR_PLACEHOLDER = '/images/avatar-placeholder.svg';

function mapMediaUrls(urls: Array<string | null | undefined> | null | undefined) {
  const mapped = (urls || [])
    .filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
    .map((url) => resolveApiUrl(url.trim()));
  return mapped.length ? mapped : [LISTING_IMAGE_PLACEHOLDER];
}

export type ApiLocation = { state: string; stateCode: string; city: string; district?: string | null };

export type ApiSeller = {
  id: string;
  name: string;
  avatarUrl?: string | null;
  verified: boolean;
  sellerType: 'individual' | 'business' | string;
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

export function mapUser(raw: any): User {
  return {
    id: String(raw.id),
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
    name: raw.name,
    avatar: raw.avatarUrl?.trim() ? resolveApiUrl(raw.avatarUrl.trim()) : AVATAR_PLACEHOLDER,
    verified: Boolean(raw.verified),
    type: raw.sellerType === 'business' ? 'business' : 'individual',
    rating: Number(raw.rating || 0),
    reviews: Number(raw.reviews || 0),
    activeListings: Number(raw.activeListings || 0),
    memberSince: raw.memberSince,
    responseRate: Number(raw.responseRate || 0),
    location: {
      state: raw.location?.state || '',
      stateCode: raw.location?.stateCode || '',
      city: raw.location?.city || '',
      district: raw.location?.district || undefined,
    },
  };
}

export function mapListing(raw: ApiListing): Listing {
  return {
    id: String(raw.id),
    slug: raw.slug,
    title: raw.title,
    description: raw.description || '',
    price: Number(raw.price ?? 0),
    category: raw.category,
    condition: (raw.condition || undefined) as Listing['condition'],
    location: {
      state: raw.location?.state || '',
      stateCode: raw.location?.stateCode || '',
      city: raw.location?.city || '',
      district: raw.location?.district || undefined,
    },
    images: mapMediaUrls(raw.images),
    sellerId: String(raw.seller?.id || ''),
    createdAt: raw.createdAt,
    views: Number(raw.views || 0),
    featured: Boolean(raw.featured),
    urgent: Boolean(raw.urgent),
    negotiable: Boolean(raw.negotiable),
    attributes: raw.attributes || undefined,
    specifications: raw.attributes
      ? Object.fromEntries(
          Object.entries(raw.attributes).filter(([, value]) => typeof value !== 'boolean') as Array<[string, string | number]>,
        )
      : undefined,
    categorySchemaVersion: raw.categorySchemaVersion,
  };
}

export function mapSellerListing(raw: ApiListing): SellerListing {
  return {
    ...mapListing(raw),
    status: raw.status as SellerListing['status'],
    inquiries: Number(raw.inquiries || 0),
    favorites: Number(raw.favorites || 0),
  };
}

export function mapCategory(raw: any): CategoryConfiguration {
  return {
    id: raw.id,
    name: raw.name,
    icon: raw.icon || 'Tag',
    schemaVersion: Number(raw.schemaVersion || 1),
    description: raw.description || '',
    pricing: {
      mode: raw.pricing?.mode === 'optional' ? 'optional' : 'required',
      label: raw.pricing?.label || 'Price (R$)',
      placeholder: raw.pricing?.placeholder || undefined,
    },
    condition: {
      enabled: raw.condition?.enabled !== false,
      required: Boolean(raw.condition?.required),
    },
    fields: (raw.fields || []).map((field: any) => ({
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

export function mapAccountProfile(raw: any): AccountProfile {
  return {
    id: String(raw.id),
    fullName: raw.name,
    email: raw.email,
    phone: raw.phone || '',
    avatar: raw.avatarUrl ? resolveApiUrl(raw.avatarUrl) : undefined,
    bio: raw.bio || undefined,
    location: {
      state: raw.location?.state || '',
      stateCode: raw.location?.stateCode || '',
      city: raw.location?.city || '',
      district: raw.location?.district || undefined,
    },
    memberSince: raw.memberSince,
    emailVerified: Boolean(raw.emailVerified),
    phoneVerified: Boolean(raw.phoneVerified),
  };
}

export function mapReview(raw: any): Review {
  return {
    id: String(raw.id),
    sellerId: String(raw.sellerId),
    reviewerName: raw.reviewerName,
    rating: Number(raw.rating),
    comment: raw.comment || '',
    date: raw.date,
    sellerReply: raw.sellerReply || undefined,
  };
}

export function mapAccountReview(raw: any): AccountReview {
  return {
    ...mapReview(raw),
    sellerName: raw.sellerName,
    sellerAvatar: raw.sellerAvatar || undefined,
    listingTitle: raw.listingTitle || undefined,
  };
}

export function mapNotification(raw: any): NotificationItem {
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

export function mapConversation(raw: any): Conversation {
  return {
    id: String(raw.id),
    participant: {
      id: String(raw.participant.id),
      name: raw.participant.name,
      avatar: raw.participant.avatarUrl?.trim() ? resolveApiUrl(raw.participant.avatarUrl.trim()) : AVATAR_PLACEHOLDER,
      verified: Boolean(raw.participant.verifiedSeller),
      type: raw.participant.isSeller ? 'business' : 'individual',
      rating: 0,
      reviews: 0,
      activeListings: 0,
      memberSince: '',
      responseRate: 0,
      location: { state: '', stateCode: '', city: '' },
    },
    listing: {
      id: String(raw.listing.id || ''),
      slug: raw.listing.slug || '',
      title: raw.listing.title,
      description: '',
      price: Number(raw.listing.price ?? 0),
      category: '',
      location: { state: '', stateCode: '', city: '' },
      images: mapMediaUrls([raw.listing.primaryImage]),
      sellerId: '',
      createdAt: raw.lastMessageAt || new Date(0).toISOString(),
      views: 0,
      status: raw.listing.status || undefined,
    },
    lastMessage: raw.lastMessage || '',
    lastMessageAt: raw.lastMessageAt || '',
    unread: Number(raw.unread || 0),
    blocked: Boolean(raw.blocked),
  };
}

export function mapMessage(raw: any): Message {
  return {
    id: String(raw.id),
    conversationId: String(raw.conversationId),
    sender: raw.sender === 'me' ? 'me' : 'seller',
    text: raw.text || '',
    createdAt: raw.createdAt,
    read: Boolean(raw.read),
    attachment: raw.attachment
      ? {
          type: 'image',
          url: resolveApiUrl(raw.attachment.url),
          name: raw.attachment.name,
          mimeType: raw.attachment.mimeType,
          size: Number(raw.attachment.size || 0),
        }
      : undefined,
  };
}

export function mapVerification(raw: any): VerificationSubmission {
  return {
    id: String(raw.id),
    cpfMasked: raw.cpfMasked,
    fullName: raw.legalName,
    birthDate: raw.birthDate,
    status: raw.status === 'verified' ? 'verified' : raw.status === 'rejected' ? 'rejected' : 'pending',
    submittedAt: raw.submittedAt,
    providerResult: raw.providerResult || undefined,
    riskFlags: raw.riskFlags || [],
  };
}

export function mapPlan(raw: any): SellerPlan {
  return {
    id: raw.id,
    name: raw.name,
    monthlyPrice: Number(raw.monthlyPrice || 0),
    yearlyPrice: Number(raw.yearlyPrice || 0),
    listingLimit: Number(raw.listingLimit || 0),
    promotionCredits: Number(raw.promotionCredits || 0),
    features: raw.features || [],
    visibilityWeight: Number(raw.visibilityWeight || 1),
    recommended: Boolean(raw.recommended),
  };
}

export function mapPromotion(raw: any): PromotionOption {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    durationDays: Number(raw.durationDays || 0),
    price: Number(raw.price || 0),
  } as PromotionOption;
}

export function mapPayment(raw: any): Payment {
  return {
    id: String(raw.id),
    purpose: raw.purpose,
    amount: Number(raw.amount || 0),
    method: raw.method,
    status: raw.status === 'refunded' ? 'cancelled' : raw.status,
    createdAt: raw.createdAt,
    reference: raw.reference,
    checkoutData: raw.checkoutData || {},
    planId: raw.planId || undefined,
    billingCycle: raw.billingCycle || undefined,
    listingId: raw.listingId ? String(raw.listingId) : undefined,
    promotionId: raw.promotionId || undefined,
  } as Payment;
}
