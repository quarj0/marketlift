'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
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

const subscribeToHydration = () => () => undefined;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const sessionSnapshot = useSyncExternalStore(
    subscribeToAuth,
    authService.getSessionSnapshot,
    () => '',
  );

  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

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
