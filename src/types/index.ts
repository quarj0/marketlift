export type ListingCondition = 'New' | 'Like new' | 'Used';
export type VerificationStatus = 'not_verified' | 'pending' | 'verified' | 'rejected';
export type SellerType = 'individual' | 'business';

export interface Location {
  state: string;
  stateCode: string;
  city: string;
  district?: string;
}

/**
 * Marketlift has one customer account type. Selling is an optional capability
 * on that same account, not a separate login or role.
 */
export interface UserSellerProfile {
  sellerId: string;
  activatedAt: string;
  verified: boolean;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  sellerProfile?: UserSellerProfile;
}

export interface Seller {
  id: string;
  name: string;
  avatar: string;
  location: Location;
  verified: boolean;
  rating: number;
  reviews: number;
  activeListings: number;
  memberSince: string;
  responseRate: number;
  type?: SellerType;
}

export type CategoryFieldType = 'text' | 'textarea' | 'number' | 'select' | 'boolean';
export type CategoryFieldValue = string | number | boolean;
export type ListingAttributes = Record<string, CategoryFieldValue>;

export interface CategoryFieldOption {
  value: string;
  label: string;
}

export interface CategoryFieldDefinition {
  id: string;
  label: string;
  type: CategoryFieldType;
  required: boolean;
  filterable: boolean;
  allowCustomValue?: boolean;
  placeholder?: string;
  helpText?: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: CategoryFieldOption[];
}

export interface CategoryConfiguration extends Category {
  schemaVersion: number;
  description: string;
  pricing: {
    mode: 'required' | 'optional';
    label: string;
    placeholder?: string;
  };
  condition: {
    enabled: boolean;
    required: boolean;
  };
  fields: CategoryFieldDefinition[];
}

export interface Listing {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition?: ListingCondition;
  location: Location;
  images: string[];
  sellerId: string;
  createdAt: string;
  views: number;
  featured?: boolean;
  urgent?: boolean;
  negotiable?: boolean;
  specifications?: Record<string, string | number>;
  attributes?: ListingAttributes;
  categorySchemaVersion?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface SearchFilters {
  q?: string;
  category?: string;
  state?: string;
  city?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ListingCondition | '';
  sellerType?: SellerType | '';
  verifiedOnly?: boolean;
  dateListed?: 'today' | 'week' | 'month' | '';
  sort?: 'relevant' | 'newest' | 'price_asc' | 'price_desc';
}

/**
 * Listings normally publish immediately after automated validation.
 * `under_review` is exceptional and should only be used when risk signals,
 * reports, or category rules require additional moderation.
 */
export type ListingStatus =
  | 'draft'
  | 'published'
  | 'paused'
  | 'sold'
  | 'expired'
  | 'under_review'
  | 'rejected'
  | 'removed';

export interface SellerListing extends Listing {
  status: ListingStatus;
  inquiries: number;
  favorites: number;
}

export interface AccountProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  bio?: string;
  location: Location;
  memberSince: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export interface AccountSettings {
  language: 'en' | 'pt-BR';
  currency: 'BRL';
  emailMessages: boolean;
  emailListingUpdates: boolean;
  emailRecommendations: boolean;
  pushMessages: boolean;
  pushListingUpdates: boolean;
  marketingEmails: boolean;
  showPhoneToSellers: boolean;
  showOnlineStatus: boolean;
}

export interface AccountReview extends Review {
  sellerName: string;
  sellerAvatar?: string;
  listingTitle?: string;
}

export interface AccountOverview {
  savedCount: number;
  unreadMessages: number;
  reviewsCount: number;
  recentlyViewed: Listing[];
  savedListings: Listing[];
}

export interface SellingDashboardData {
  active: number;
  drafts: number;
  underReview: number;
  views: number;
  messages: number;
  plan: { name: string; used: number; limit: number };
  recentListings: SellerListing[];
}

export type BillingCycle = 'monthly' | 'yearly';
export type PaymentMethod = 'pix' | 'card' | 'boleto';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled';

export interface SellerPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  listingLimit: number;
  promotionCredits: number;
  features: string[];
  visibilityWeight: number;
  recommended?: boolean;
}

export interface Payment {
  id: string;
  purpose: 'subscription' | 'promotion';
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  reference: string;
}

export type PromotionType = 'featured' | 'top_search' | 'urgent' | 'homepage';

export interface PromotionOption {
  id: PromotionType;
  name: string;
  description: string;
  durationDays: number;
  price: number;
}

export interface Conversation {
  id: string;
  participant: Seller;
  listing: Listing;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
}

export interface MessageAttachment {
  type: "image";
  url: string;
  name: string;
  mimeType: string;
  size: number;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: "me" | "seller";
  text: string;
  createdAt: string;
  read: boolean;
  attachment?: MessageAttachment;
}

export interface SendMessagePayload {
  text?: string;
  image?: File;
}

export interface VerificationSubmission {
  id: string;
  cpfMasked: string;
  fullName: string;
  birthDate: string;
  status: VerificationStatus;
  submittedAt: string;
  providerResult?: string;
  riskFlags: string[];
}

export interface Review {
  id: string;
  sellerId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
  sellerReply?: string;
}

export interface NotificationItem {
  id: string;
  type: 'message' | 'listing' | 'subscription' | 'payment' | 'review' | 'verification';
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;
}

export type ReportReason =
  | 'fraud'
  | 'fake_listing'
  | 'incorrect_info'
  | 'prohibited'
  | 'offensive'
  | 'duplicate'
  | 'other';

export interface MarketplaceReport {
  id: string;
  targetType: 'listing' | 'seller' | 'message';
  targetId: string;
  reporter: string;
  reason: ReportReason;
  description: string;
  createdAt: string;
  status: 'open' | 'dismissed' | 'actioned';
}
