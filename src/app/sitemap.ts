import type { MetadataRoute } from "next";
import { API_BASE_URL } from "@/lib/api-client";

type SearchResult = { slug: string; createdAt: string };
type SearchResponse = { results?: SearchResult[] };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    "https://marketlift.com.br";
  let listings: SearchResult[] = [];

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/search/listings/?pageSize=50&sort=newest`,
      {
        next: { revalidate: 3600 },
      },
    );
    if (response.ok) {
      const body = (await response.json()) as SearchResponse;
      listings = body.results ?? [];
    }
  } catch {
    // Static routes remain valid when the API is temporarily unavailable during a build.
  }

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/search`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/safety`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/help`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    ...listings.map((listing) => ({
      url: `${base}/listing/${listing.slug}`,
      lastModified: new Date(listing.createdAt),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
