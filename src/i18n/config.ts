export const SUPPORTED_LOCALES = ["en", "pt-BR"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "pt-BR";
export const LOCALE_STORAGE_KEY = "marketlift-locale";
export const LOCALE_CHANGE_EVENT = "marketlift:locale-change";

export function normalizeLocale(value: string | null | undefined): Locale {
  if (!value) return DEFAULT_LOCALE;

  const normalized = value.trim().toLowerCase();

  if (
    normalized === "pt-br" ||
    normalized === "pt_br" ||
    normalized === "pt" ||
    normalized === "br"
  ) {
    return "pt-BR";
  }

  return "en";
}

export function readStoredLocale(): Locale {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  try {
    return normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function persistLocale(locale: Locale): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* Preference storage may be disabled. */
  }
  window.dispatchEvent(
    new CustomEvent(LOCALE_CHANGE_EVENT, {
      detail: { locale },
    }),
  );
}
