import { Suspense } from "react";
import type { Metadata } from "next";

import { T } from "@/components/i18n/t";
import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { ListingDetailsClient } from "@/components/listings/listing-details-client";
import { listingService } from "@/services/listing.service";

type ListingPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ListingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await listingService.getListing(slug);

  if (!listing) {
    return {
      title: "Listing not found",
      robots: { index: false, follow: false },
    };
  }

  const description = listing.description.slice(0, 155);

  return {
    title: `${listing.title} — R$ ${listing.price.toLocaleString("pt-BR")}`,
    description,
    alternates: { canonical: `/listing/${listing.slug}` },
    openGraph: {
      title: listing.title,
      description,
      images: listing.images.slice(0, 1),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: listing.title,
      description,
      images: listing.images.slice(0, 1),
    },
  };
}

function ListingFallback() {
  return (
    <main
      className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
      aria-busy="true"
    >
      <div className="grid animate-pulse gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="aspect-4/3 rounded-3xl bg-slate-200" />
          <div className="h-64 rounded-3xl border bg-white" />
        </div>
        <div className="h-96 rounded-3xl border bg-white" />
      </div>
      <span className="sr-only"><T id="common.loading" /></span>
    </main>
  );
}

async function ListingContent({ params }: ListingPageProps) {
  const { slug } = await params;
  const listing = await listingService.getListing(slug);

  const jsonLd = listing
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: listing.title,
        description: listing.description,
        image: listing.images,
        offers: {
          "@type": "Offer",
          priceCurrency: "BRL",
          price: listing.price,
          availability: "https://schema.org/InStock",
        },
        areaServed: `${listing.location.city}, ${listing.location.stateCode}`,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ListingDetailsClient slug={slug} />
    </>
  );
}

export default function ListingPage(props: ListingPageProps) {
  return (
    <MarketplaceShell>
      <Suspense fallback={<ListingFallback />}>
        <ListingContent {...props} />
      </Suspense>
    </MarketplaceShell>
  );
}
