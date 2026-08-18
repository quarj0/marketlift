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
    sitemap: "https://marketlift.com.br/sitemap.xml",
  };
}
