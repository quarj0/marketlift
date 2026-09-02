import type { Metadata } from "next";
import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { HomepageContent } from "@/components/marketplace/homepage-content";

export const metadata: Metadata = {
  title: "Marketlift Brazil — Buy and Sell Online",
  description:
    "Buy and sell cars, phones, electronics, fashion, property and everyday items across Brazil on Marketlift's trusted local marketplace.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://marketlift.com.br"
  ).replace(/\/+$/, "");
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Marketlift",
      alternateName: "Marketlift Brazil",
      url: siteUrl,
      logo: `${siteUrl}/brand/marketlift-mark.png`,
      description:
        "A trusted online marketplace for buying and selling locally across Brazil.",
      areaServed: {
        "@type": "Country",
        name: "Brazil",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Marketlift",
      alternateName: "Marketlift Brazil",
      url: siteUrl,
      inLanguage: ["pt-BR", "en"],
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MarketplaceShell>
        <HomepageContent />
      </MarketplaceShell>
    </>
  );
}
