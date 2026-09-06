import "server-only";
import { cacheLife } from "next/cache";
import { API_BASE_URL } from "@/lib/api-client";
export const siteBase = (process.env.NEXT_PUBLIC_SITE_URL || "https://marketlift.com.br").replace(/\/+$/, "");
export const xmlEscape = (value: string) => value.replace(/[<>&"']/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[char]!));
export const xmlResponse = (body: string) => new Response(`<?xml version="1.0" encoding="UTF-8"?>${body}`, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=900, stale-while-revalidate=900" } });
export async function sitemapData(bucket?: string) {
  "use cache";
  cacheLife({ stale: 900, revalidate: 900, expire: 3600 });
  const params = new URLSearchParams({ countryCode: "BR" });
  if (bucket) params.set("bucket", bucket);
  const response = await fetch(`${API_BASE_URL}/api/v1/sitemap/?${params}`, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error("Sitemap inventory unavailable");
  return response.json() as Promise<{ partitions?: { bucket: string; count: number; modified: string }[]; listings?: { slug: string; updated_at: string }[] }>;
}
