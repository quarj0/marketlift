export type ListingCondition = string;
export type VerificationStatus =
  | "not_verified"
  | "pending"
  | "verified"
  | "rejected";
export type SellerType = "individual" | "business";

export interface Location {
  countryCode?: string;
  state: string;
  stateCode: string;
  city: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  locationToken?: string;
}

/**
 * Marketlift has one customer account type. Selling is an optional capability
 * on that same account, not a separate login or role.
 */
export interface UserSellerProfile {
  sellerId: string;
  sellerType?: SellerType;
  sellerVerified?: boolean;
  activatedAt: string;
  verified: boolean;
}

export interface User {
  id: string;
  countryCode?: string;
  name: string;
  email?: string;
  phone?: string;
  sellerProfile?: UserSellerProfile;
}

export interface Seller {
  id: string;
  countryCode?: string;
  name: string;
  avatar: string;
  phone?: string;
  location: Location;
  verified: boolean;
  rating: number;
  reviews: number;
  activeListings: number;
  memberSince: string;
  responseRate: number;
  type?: SellerType;
}

export type CategoryFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "boolean";
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
  dependsOn?: string;
  lazyOptions?: boolean;
  optionCount?: number;
  placeholder?: string;
  helpText?: string;
  uiGroup?: string;
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
    mode: "required" | "optional";
    label: string;
    placeholder?: string;
  };
  condition: {
    enabled: boolean;
    required: boolean;
    options: string[];
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
  sellerVerified?: boolean;
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
  imageUrl?: string;
  active?: boolean;
  subcategories?: Category[];
}

export interface SearchFilters {
  q?: string;
  countryCode?: string;
  category?: string;
  region?: string;
  state?: string;
  city?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  minPrice?: number;
  maxPrice?: number;
  attributes?: Record<
    string,
    string | number | boolean | { min?: number; max?: number }
  >;
  condition?: ListingCondition | "";
  sellerType?: SellerType | "";
  verifiedOnly?: boolean;
  dateListed?: "today" | "week" | "month" | "";
  sort?: "relevant" | "newest" | "price_asc" | "price_desc" | "distance";
}

export type SearchSort = NonNullable<SearchFilters["sort"]>;

export interface SearchResult {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency?: string;
  image: string;
  condition?: ListingCondition;
  location: Location;
  sellerVerified?: boolean;
  createdAt: string;
  featured?: boolean;
  urgent?: boolean;
  distanceKm?: number;
}

export interface SellerListing extends Listing {
  status: "draft" | "published" | "paused" | "sold" | "expired" | "under_review" | "rejected" | "removed";
  favorites?: number;
  inquiries?: number;
}
