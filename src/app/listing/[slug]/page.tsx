import { Suspense } from "react";
import type { Metadata } from "next";

import { T } from "@/components/i18n/t";
import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { ListingDetailsClient } from "@/components/listings/listing-details-client";
import { listingService } from "@/services/listing.service";
import { marketService, type MarketProfile } from "@/services/market.service";

type ListingPageProps = {
  params: Promise<{ slug: string }>;
};

function fallbackMarket(countryCode?: string | null): MarketProfile {
  const code=(countryCode||"GH").toUpperCase();
  const profiles:Record<string,Pick<MarketProfile,"countryCode"|"countryName"|"locale"|"languageCode"|"currency"|"currencySymbol">>={
    BR:{countryCode:"BR",countryName:"Brazil",locale:"pt-BR",languageCode:"pt",currency:"BRL",currencySymbol:"R$"},
    GH:{countryCode:"GH",countryName:"Ghana",locale:"en-GH",languageCode:"en",currency:"GHS",currencySymbol:"GH₵"},
    NG:{countryCode:"NG",countryName:"Nigeria",locale:"en-NG",languageCode:"en",currency:"NGN",currencySymbol:"₦"},
    KE:{countryCode:"KE",countryName:"Kenya",locale:"en-KE",languageCode:"en",currency:"KES",currencySymbol:"KSh"},
    ZA:{countryCode:"ZA",countryName:"South Africa",locale:"en-ZA",languageCode:"en",currency:"ZAR",currencySymbol:"R"},
    CI:{countryCode:"CI",countryName:"Côte d’Ivoire",locale:"fr-CI",languageCode:"fr",currency:"XOF",currencySymbol:"FCFA"},
  };
  const base=profiles[code]||profiles.GH;
  return {code,...base,paymentProvider:"disabled",paymentMethods:[],identityLabel:"Identity",identityKey:"identity",locationMode:code==="BR"?"catalog":"geocoder"};
}

async function listingMarket(countryCode?:string|null){
  try{const capabilities=await marketService.getCapabilities();return capabilities.enabledMarkets.find((m)=>m.code===countryCode)||capabilities.active;}catch{return fallbackMarket(countryCode);}
}

function formatPrice(value:number, market:MarketProfile){
  return new Intl.NumberFormat(market.locale,{style:"currency",currency:market.currency,maximumFractionDigits:market.currency==="XOF"?0:2}).format(value).replace(/\u00a0/g," ");
}

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
  const market = await listingMarket(listing.location.countryCode);

  return {
    title: `${listing.title} — ${formatPrice(listing.price, market)}`,
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
  const market = listing ? await listingMarket(listing.location.countryCode) : null;

  const jsonLd = listing && market
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: listing.title,
        description: listing.description,
        image: listing.images,
        offers: {
          "@type": "Offer",
          priceCurrency: market.currency,
          price: listing.price,
          availability: "https://schema.org/InStock",
        },
        areaServed: [listing.location.city, listing.location.stateCode, market.countryName].filter(Boolean).join(", "),
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
