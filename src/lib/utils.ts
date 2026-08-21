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
