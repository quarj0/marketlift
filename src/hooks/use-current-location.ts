'use client';

import { useCallback, useState } from 'react';

import { locationService } from '@/services/location.service';
import type { Location } from '@/types';

export type CurrentLocationErrorCode =
  | 'unsupported'
  | 'denied'
  | 'failed'
  | 'outside_brazil';

export function useCurrentLocation() {
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
      const resolved = await locationService.reverse(latitude, longitude);
      if (!resolved) {
        setErrorCode('outside_brazil');
        return null;
      }
      return resolved;
    } catch (error) {
      const code =
        typeof error === 'object' && error && 'code' in error
          ? Number((error as { code?: unknown }).code)
          : 0;
      setErrorCode(code === 1 ? 'denied' : 'failed');
      return null;
    } finally {
      setLocating(false);
    }
  }, []);

  return { locate, locating, errorCode, clearError };
}
