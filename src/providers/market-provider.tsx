'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { marketService, type MarketCapabilities, type MarketProfile } from '@/services/market.service';

const STORAGE_KEY = 'marketlift.marketCode';

const FALLBACK_MARKET: MarketProfile = {
  code: 'GH',
  countryCode: 'GH',
  countryName: 'Ghana',
  locale: 'en-GH',
  languageCode: 'en-gb',
  currency: 'GHS',
  currencySymbol: 'GH₵',
  paymentProvider: 'paystack',
  paymentMethods: ['card', 'mobile_money'],
  identityLabel: 'Ghana Card',
  identityKey: 'national_id',
  locationMode: 'geocoder',
};

type MarketContextValue = {
  market: MarketProfile;
  defaultMarket: MarketProfile;
  enabledMarkets: MarketProfile[];
  capabilities: MarketCapabilities | null;
  loading: boolean;
  setMarket: (code: string) => void;
  formatMoney: (value: number, currency?: string) => string;
};

const MarketContext = createContext<MarketContextValue | null>(null);

function readStoredMarketCode() {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(STORAGE_KEY)?.trim().toUpperCase() || '';
  } catch {
    return '';
  }
}

export function MarketProvider({ children }: { children: ReactNode }) {
  const query = useQuery({
    queryKey: ['market-capabilities'],
    queryFn: marketService.getCapabilities,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
  const [selectedCode, setSelectedCode] = useState(readStoredMarketCode);

  const enabledMarkets = useMemo(
    () => query.data?.enabledMarkets?.length
      ? query.data.enabledMarkets
      : [query.data?.active || FALLBACK_MARKET],
    [query.data],
  );
  const defaultMarket = query.data?.active || enabledMarkets[0] || FALLBACK_MARKET;
  const market =
    enabledMarkets.find((item) => item.code === selectedCode) || defaultMarket;


  useEffect(() => {
    if (!market?.code || typeof document === 'undefined') return;
    document.documentElement.dataset.market = market.code;
    document.documentElement.dataset.currency = market.currency;
  }, [market.code, market.currency]);

  const setMarket = useCallback((code: string) => {
    const normalized = code.trim().toUpperCase();
    setSelectedCode(normalized);
    try {
      window.localStorage.setItem(STORAGE_KEY, normalized);
    } catch {
      // Browsing remains functional when storage is unavailable.
    }
  }, []);

  const formatMoney = useCallback(
    (value: number, currency = market.currency) => {
      try {
        return new Intl.NumberFormat(market.locale || 'en', {
          style: 'currency',
          currency,
          maximumFractionDigits: currency === 'XOF' ? 0 : 2,
        }).format(value);
      } catch {
        return `${market.currencySymbol}${Number(value).toLocaleString()}`;
      }
    },
    [market.currency, market.currencySymbol, market.locale],
  );

  const value = useMemo<MarketContextValue>(
    () => ({
      market,
      defaultMarket,
      enabledMarkets,
      capabilities: query.data || null,
      loading: query.isLoading,
      setMarket,
      formatMoney,
    }),
    [market, defaultMarket, enabledMarkets, query.data, query.isLoading, setMarket, formatMoney],
  );

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarket() {
  const value = useContext(MarketContext);
  if (!value) throw new Error('useMarket must be used inside MarketProvider.');
  return value;
}
