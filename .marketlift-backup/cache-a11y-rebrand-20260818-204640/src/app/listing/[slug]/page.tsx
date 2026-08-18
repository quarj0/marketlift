import type { Metadata } from "next";
import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { ListingDetailsClient } from "@/components/listings/listing-details-client";
import { listingService } from "@/services/listing.service";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const l = await listingService.getListing(slug);
  if (!l)
    return {
      title: "Listing not found",
      robots: { index: false, follow: false },
    };
  const description = l.description.slice(0, 155);
  return {
    title: `${l.title} — R$ ${l.price.toLocaleString("pt-BR")}`,
    description,
    alternates: { canonical: `/listing/${l.slug}` },
    openGraph: {
      title: l.title,
      description,
      images: l.images.slice(0, 1),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: l.title,
      description,
      images: l.images.slice(0, 1),
    },
  };
}
export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const l = await listingService.getListing(slug);
  const jsonLd = l
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: l.title,
        description: l.description,
        image: l.images,
        offers: {
          "@type": "Offer",
          priceCurrency: "BRL",
          price: l.price,
          availability: "https://schema.org/InStock",
        },
        areaServed: `${l.location.city}, ${l.location.stateCode}`,
      }
    : null;
  return (
    <MarketplaceShell>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ListingDetailsClient slug={slug} />
    </MarketplaceShell>
  );
}
