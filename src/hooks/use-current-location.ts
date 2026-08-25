'use client';

import { useCallback, useState } from 'react';
import { locationService } from '@/services/location.service';
import { useMarket } from '@/providers/market-provider';
import type { Location } from '@/types';

export type CurrentLocationErrorCode =
  | 'unsupported'
  | 'denied'
  | 'failed'
  | 'outside_market';

export function useCurrentLocation(countryCode?: string) {
  const { market } = useMarket();
  const selectedCountry = (countryCode || market.code).toUpperCase();
  const [locating, setLocating] = useState(false);
  const [errorCode, setErrorCode] = useState<CurrentLocationErrorCode | null>(null);

  const clearError = useCallback(() => setErrorCode(null), []);

  const locate = useCallback(async (): Promise<Location | null> => {
    setErrorCode(null);
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setErrorCode('unsupported');
      return null;
    }
    setLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12_000,
          maximumAge: 5 * 60_000,
        });
      });
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const resolved = await locationService.reverse(latitude, longitude, selectedCountry);
      if (!resolved) {
        setErrorCode('outside_market');
        return null;
      }
      return resolved;
    } catch (error) {
      const code = typeof error === 'object' && error && 'code' in error ? Number((error as { code?: unknown }).code) : 0;
      setErrorCode(code === 1 ? 'denied' : 'failed');
      return null;
    } finally {
      setLocating(false);
    }
  }, [selectedCountry]);

  return { locate, locating, errorCode, clearError };
}
