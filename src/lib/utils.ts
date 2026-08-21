import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind/className values safely.
 *
 * Required by shadcn UI components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Brazilian Real.
 *
 * Examples:
 * 89000      -> R$ 89.000
 * 1299.9     -> R$ 1.299,90
 */
export function formatBRL(value: number): string {
  if (!Number.isFinite(value)) {
    return "R$ 0";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Convert a date into a human-friendly relative value.
 *
 * Examples:
 * 5 minutes ago
 * 2 hours ago
 * Yesterday
 * 3 days ago
 *
 * If the value isn't a valid date, return it unchanged.
 * This supports legacy human-readable labels such
 * as "Yesterday" or "Mon".
 */
export function formatRelativeDate(value: string | Date, locale: "en" | "pt-BR" = "en"): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : "";
  }

  const now = Date.now();
  const differenceInSeconds = Math.round((date.getTime() - now) / 1000);

  const absoluteSeconds = Math.abs(differenceInSeconds);

  const formatter = new Intl.RelativeTimeFormat(locale, {
    numeric: "auto",
  });

  if (absoluteSeconds < 60) {
    return formatter.format(differenceInSeconds, "second");
  }

  const minutes = Math.round(differenceInSeconds / 60);

  if (Math.abs(minutes) < 60) {
    return formatter.format(minutes, "minute");
  }

  const hours = Math.round(minutes / 60);

  if (Math.abs(hours) < 24) {
    return formatter.format(hours, "hour");
  }

  const days = Math.round(hours / 24);

  if (Math.abs(days) < 7) {
    return formatter.format(days, "day");
  }

  const weeks = Math.round(days / 7);

  if (Math.abs(weeks) < 5) {
    return formatter.format(weeks, "week");
  }

  const months = Math.round(days / 30);

  if (Math.abs(months) < 12) {
    return formatter.format(months, "month");
  }

  const years = Math.round(days / 365);

  return formatter.format(years, "year");
}

export function formatReadableDate(
  value: string | Date,
  locale: "en" | "pt-BR" = "en",
  dateStyle: "full" | "long" | "medium" | "short" = "medium",
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return typeof value === "string" ? value : "";
  return new Intl.DateTimeFormat(locale === "pt-BR" ? "pt-BR" : "en-US", {
    dateStyle,
  }).format(date);
}

/**
 * Compact chat timestamp that keeps the clock readable without exposing raw ISO
 * values. Today shows the time, yesterday is labelled, and older messages show
 * a localized calendar date plus time.
 */
export function formatMessageTimestamp(
  value: string | Date,
  locale: "en" | "pt-BR" = "en",
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const yesterdayKey = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;
  const intlLocale = locale === "pt-BR" ? "pt-BR" : "en-US";
  const time = new Intl.DateTimeFormat(intlLocale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  if (dateKey === todayKey) return time;
  if (dateKey === yesterdayKey) {
    return `${locale === "pt-BR" ? "Ontem" : "Yesterday"}, ${time}`;
  }

  return new Intl.DateTimeFormat(intlLocale, {
    day: "2-digit",
    month: "short",
    ...(date.getFullYear() !== now.getFullYear() ? { year: "numeric" as const } : {}),
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatConversationTimestamp(
  value: string | Date,
  locale: "en" | "pt-BR" = "en",
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const sameDay = date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate();
  if (sameDay) {
    return new Intl.DateTimeFormat(locale === "pt-BR" ? "pt-BR" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const isYesterday = date.getFullYear() === yesterday.getFullYear()
    && date.getMonth() === yesterday.getMonth()
    && date.getDate() === yesterday.getDate();
  if (isYesterday) return locale === "pt-BR" ? "Ontem" : "Yesterday";

  return new Intl.DateTimeFormat(locale === "pt-BR" ? "pt-BR" : "en-US", {
    day: "2-digit",
    month: "short",
    ...(date.getFullYear() !== now.getFullYear() ? { year: "numeric" as const } : {}),
  }).format(date);
}
