'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authService } from '@/services/auth.service';
import type { User } from '@/types';

type AuthContextValue = {
  user: User | null;
  hydrated: boolean;
  isAuthenticated: boolean;
  canSell: boolean;
  refreshSession: () => Promise<void>;
  activateSelling: () => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const refreshSession = useCallback(async () => {
    try {
      setUser(await authService.getSession());
    } catch {
      setUser(null);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const activateSelling = useCallback(async () => {
    const next = await authService.activateSelling();
    setUser(next);
    return next;
  }, []);

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
