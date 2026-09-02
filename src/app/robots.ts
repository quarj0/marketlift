import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account/", "/messages/", "/notifications/", "/selling/"],
      },
    ],
    sitemap: `${(process.env.NEXT_PUBLIC_SITE_URL || "https://marketlift.com.br").replace(/\/+$/, "")}/sitemap.xml`,
  };
}
