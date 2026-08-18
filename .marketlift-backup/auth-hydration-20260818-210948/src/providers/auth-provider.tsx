'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import { authService } from '@/services/auth.service';
import type { User } from '@/types';

type AuthContextValue = {
  user: User | null;
  hydrated: boolean;
  isAuthenticated: boolean;
  canSell: boolean;
  refreshSession: () => void;
  activateSelling: () => Promise<User>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function subscribeToAuth(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('marketlift-auth-change', callback);

  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('marketlift-auth-change', callback);
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const sessionSnapshot = useSyncExternalStore(
    subscribeToAuth,
    authService.getSessionSnapshot,
    () => '',
  );

  // Keep the server render and the browser's first render identical.
  // This is especially important when the subtree is streamed behind Suspense.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setHydrated(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const user = useMemo(
    () => authService.parseSessionSnapshot(sessionSnapshot),
    [sessionSnapshot],
  );

  const refreshSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('marketlift-auth-change'));
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
  }, []);

  const activateSelling = useCallback(async () => authService.activateSelling(), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      hydrated,
      isAuthenticated: Boolean(user),
      canSell: Boolean(user?.sellerProfile),
      refreshSession,
      activateSelling,
      logout,
    }),
    [user, hydrated, refreshSession, activateSelling, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
