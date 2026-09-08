import { apiRequest } from "@/lib/api-client";

export type MarketProfile = {
  code: string;
  countryCode: string;
  countryName: string;
  dialCode: string;
  locale: string;
  languageCode: string;
  currency: string;
  currencySymbol: string;
  paymentProvider: string;
  paymentMethods: string[];
  identityLabel: string;
  identityKey: string;
  locationMode: "catalog" | "geocoder";
  paymentsEnabled: boolean;
  identityVerificationEnabled: boolean;
};

export type MarketCapabilities = {
  active: MarketProfile;
  enabledMarkets: MarketProfile[];
  payments: {
    enabled: boolean;
    provider: string;
    methods: string[];
  };
  identityVerification: {
    enabled: boolean;
    provider: string;
    label: string;
    key: string;
  };
};

export const marketService = {
  getCapabilities() {
    return apiRequest<MarketCapabilities>("/api/v1/market/");
  },
};
