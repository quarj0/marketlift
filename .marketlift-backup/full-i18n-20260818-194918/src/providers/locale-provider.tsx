"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  DEFAULT_LOCALE,
  LOCALE_CHANGE_EVENT,
  LOCALE_STORAGE_KEY,
  persistLocale,
  readStoredLocale,
  type Locale,
} from "@/i18n/config";
import { translate } from "@/i18n/translations";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (
    key: string,
    values?: Record<string, string | number>,
  ) => string;
  categoryName: (id: string, fallback?: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === LOCALE_STORAGE_KEY) {
      callback();
    }
  };

  const handleLocaleChange = () => callback();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(
    LOCALE_CHANGE_EVENT,
    handleLocaleChange,
  );

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(
      LOCALE_CHANGE_EVENT,
      handleLocaleChange,
    );
  };
}

export function LocaleProvider({
  children,
}: {
  children: ReactNode;
}) {
  const locale = useSyncExternalStore(
    subscribe,
    readStoredLocale,
    () => DEFAULT_LOCALE,
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    persistLocale(nextLocale);
  }, []);

  const t = useCallback(
    (
      key: string,
      values?: Record<string, string | number>,
    ) => translate(locale, key, values),
    [locale],
  );

  const categoryName = useCallback(
    (id: string, fallback = id) => {
      const translated = translate(locale, `category.${id}`);
      return translated === `category.${id}`
        ? fallback
        : translated;
    },
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      categoryName,
    }),
    [locale, setLocale, t, categoryName],
  );

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error(
      "useLocale must be used inside LocaleProvider.",
    );
  }

  return context;
}
