import { listings } from "@/mocks/data";
import {
  normalizeLocale,
  persistLocale,
  readStoredLocale,
} from "@/i18n/config";
import type {
  AccountOverview,
  AccountProfile,
  AccountReview,
  AccountSettings,
} from "@/types";

const delay = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const SETTINGS_STORAGE_KEY =
  "marketlift-account-settings";

let profile: AccountProfile = {
  id: "user-demo",
  fullName: "Lucas Martins",
  email: "lucas@demo.marketlift",
  phone: "+55 11 99999-4321",
  bio: "I use Marketlift to find good deals around São Paulo.",
  location: {
    state: "São Paulo",
    stateCode: "SP",
    city: "São Paulo",
    district: "Vila Mariana",
  },
  memberSince: "March 2026",
  emailVerified: true,
  phoneVerified: true,
};

const defaultSettings: AccountSettings = {
  language: "en",
  currency: "BRL",
  emailMessages: true,
  emailListingUpdates: true,
  emailRecommendations: false,
  pushMessages: true,
  pushListingUpdates: true,
  marketingEmails: false,
  showPhoneToSellers: false,
  showOnlineStatus: true,
};

let settings: AccountSettings = {
  ...defaultSettings,
};

let myReviews: AccountReview[] = [
  {
    id: "my-rv-1",
    sellerId: "seller-1",
    sellerName: "AutoPrime SP",
    reviewerName: "Lucas Martins",
    rating: 5,
    comment:
      "Clear communication and the vehicle matched the description. The seller was punctual and professional.",
    date: "2026-08-10",
    sellerReply:
      "Thanks, Lucas. It was a pleasure doing business with you!",
    listingTitle: "Honda Civic 2018 EXL",
  },
  {
    id: "my-rv-2",
    sellerId: "seller-2",
    sellerName: "Tech House Brasil",
    reviewerName: "Lucas Martins",
    rating: 4,
    comment:
      "Fast responses and everything was as described. Pickup was easy to arrange.",
    date: "2026-07-22",
    listingTitle: "iPhone 15 Pro 256 GB",
  },
];

function readStoredSettings(): AccountSettings | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value = window.localStorage.getItem(
      SETTINGS_STORAGE_KEY,
    );

    if (!value) return null;

    const stored = JSON.parse(value) as Partial<AccountSettings> & {
      language?: string;
    };

    return {
      ...defaultSettings,
      ...stored,
      // The navbar switcher is the source of truth for the current
      // device language, including for signed-out visitors.
      language: readStoredLocale(),
    };
  } catch {
    return null;
  }
}

function persistSettings(value: AccountSettings) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    SETTINGS_STORAGE_KEY,
    JSON.stringify(value),
  );
}

export const accountService = {
  async getOverview(): Promise<AccountOverview> {
    await delay();

    return {
      savedCount: 6,
      unreadMessages: 3,
      reviewsCount: myReviews.length,
      recentlyViewed: listings.slice(0, 4),
      savedListings: [
        listings[0],
        listings[2],
        listings[6],
      ],
    };
  },

  async getSaved() {
    await delay();

    return [
      listings[0],
      listings[2],
      listings[6],
      listings[8],
    ];
  },

  async getProfile(): Promise<AccountProfile> {
    await delay();

    return {
      ...profile,
      location: { ...profile.location },
    };
  },

  async updateProfile(
    input: Partial<AccountProfile>,
  ): Promise<AccountProfile> {
    await delay(450);

    profile = {
      ...profile,
      ...input,
      location: input.location
        ? {
            ...profile.location,
            ...input.location,
          }
        : profile.location,
    };

    return {
      ...profile,
      location: { ...profile.location },
    };
  },

  async getSettings(): Promise<AccountSettings> {
    await delay();

    const stored = readStoredSettings();

    if (stored) {
      settings = stored;
    }

    settings = {
      ...settings,
      language: readStoredLocale(),
    };

    return { ...settings };
  },

  async updateSettings(
    input: Partial<AccountSettings>,
  ): Promise<AccountSettings> {
    await delay(350);

    settings = {
      ...settings,
      ...input,
      language: input.language
        ? normalizeLocale(input.language)
        : settings.language,
    };

    persistSettings(settings);

    if (input.language) {
      persistLocale(settings.language);
    }

    return { ...settings };
  },

  async getMyReviews(): Promise<AccountReview[]> {
    await delay();
    return [...myReviews];
  },

  async deleteReview(id: string) {
    await delay(250);

    myReviews = myReviews.filter(
      (review) => review.id !== id,
    );

    return { success: true };
  },
};
