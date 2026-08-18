import type { MetadataRoute } from "next";
import { listings, sellers } from "@/mocks/data";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://marketlift.com.br";
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/search`, changeFrequency: "hourly", priority: 0.9 },
    ...listings.map((l) => ({
      url: `${base}/listing/${l.slug}`,
      lastModified: new Date(l.createdAt),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...sellers.map((s) => ({
      url: `${base}/seller/${s.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
