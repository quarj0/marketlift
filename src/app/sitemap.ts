import type { MetadataRoute } from "next";
import { API_BASE_URL } from "@/lib/api-client";
import { flattenCategories } from "@/lib/category-tree";
import { categoryService } from "@/services/category.service";

type SearchResult = { slug: string; createdAt: string };
type SearchResponse = { results?: SearchResult[] };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    "https://marketlift.com.br";
  let listings: SearchResult[] = [];
  let categorySlugs: string[] = [];

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

  try {
    const categories = await categoryService.getCategories();
    categorySlugs = flattenCategories(categories).map(({ category }) => category.id);
  } catch {
    // Keep the sitemap available if the category API is temporarily unavailable.
  }

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/search`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/safety`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/help`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    ...categorySlugs.map((slug) => ({
      url: `${base}/category/${slug}`,
      changeFrequency: "daily" as const,
      priority: 0.75,
    })),
    ...listings.map((listing) => ({
      url: `${base}/listing/${listing.slug}`,
      lastModified: new Date(listing.createdAt),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
