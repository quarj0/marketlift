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
      "@id": `${siteUrl}/#organization`,
      name: "Marketlift",
      alternateName: ["Marketlift Brasil", "Marketlift Brazil"],
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        "@id": `${siteUrl}/#logo`,
        url: `${siteUrl}/brand/marketlift-mark.png`,
        contentUrl: `${siteUrl}/brand/marketlift-mark.png`,
        width: 512,
        height: 512,
        caption: "Marketlift",
      },
      image: { "@id": `${siteUrl}/#logo` },
      description:
        "Marketlift is a Brazilian online marketplace for local classified listings, connecting buyers and sellers of vehicles, property, electronics, fashion and everyday items.",
      areaServed: {
        "@type": "Country",
        name: "Brazil",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "Marketlift",
      alternateName: [
        "Marketlift Brasil",
        "Marketlift Brazil",
        "marketlift.com.br",
      ],
      url: siteUrl,
      description:
        "Brazilian marketplace for buying and selling through local classified listings.",
      inLanguage: ["pt-BR", "en"],
      publisher: { "@id": `${siteUrl}/#organization` },
      about: { "@id": `${siteUrl}/#organization` },
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
