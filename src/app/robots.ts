import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://marketlift.com.br"
  ).replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account/", "/messages/", "/notifications/", "/selling/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
