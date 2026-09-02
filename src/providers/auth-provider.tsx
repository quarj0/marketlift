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
  login: (input: { emailOrPhone: string; password: string }) => Promise<User>;
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
    const timeoutId = window.setTimeout(() => {
      void refreshSession();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [refreshSession]);

  const login = useCallback(
    async (input: { emailOrPhone: string; password: string }) => {
      const next = await authService.login(input);
      setUser(next);
      setHydrated(true);
      return next;
    },
    [],
  );

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
      login,
      refreshSession,
      activateSelling,
      logout,
    }),
    [user, hydrated, login, refreshSession, activateSelling, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
