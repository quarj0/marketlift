import { Suspense } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, MapPin, Star } from "lucide-react";

import { LocalizedDate, T } from "@/components/i18n/t";
import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { ListingCard } from "@/components/listings/listing-card";
import { SellerProfileActions } from "@/components/seller/seller-profile-actions";
import { SellerReviewForm } from "@/components/seller/seller-review-form";
import { socialService } from "@/services/social.service";
import { releaseFeatures } from "@/lib/release-features";

type SellerProfilePageProps = {
  params: Promise<{ sellerId: string }>;
};

function SellerProfileFallback() {
  return (
    <main
      className="mx-auto max-w-7xl px-4 py-6 pb-24 sm:px-6 sm:py-8 lg:px-8 lg:pb-8"
      aria-busy="true"
    >
      <div className="animate-pulse space-y-8">
        <div className="h-40 rounded-3xl border bg-white" />
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-72 rounded-2xl border bg-white" />
            ))}
          </div>
          <div className="h-96 rounded-2xl border bg-white" />
        </div>
      </div>
      <span className="sr-only"><T id="common.loading" /></span>
    </main>
  );
}

async function SellerProfileContent({ params }: SellerProfilePageProps) {
  const { sellerId } = await params;
  const data = await socialService.getSellerProfile(sellerId);

  if (!data) {
    notFound();
  }

  const { seller, listings, reviews } = data;
  const sellerLocation = [seller.location.city, seller.location.stateCode].filter(Boolean).join(", ");

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 pb-24 sm:px-6 sm:py-8 lg:px-8 lg:pb-8">
      <section className="rounded-3xl border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <Image
            src={seller.avatar}
            alt=""
            width={96}
            height={96}
            unoptimized
            className="size-24 rounded-3xl object-cover"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold">{seller.name}</h1>

              {releaseFeatures.cpfVerification && seller.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  <T id="seller.verified" />
                </span>
              )}
            </div>

            <p className="mt-2 flex flex-wrap items-center gap-1 text-sm text-slate-500">
              {sellerLocation && (
                <>
                  <MapPin className="size-4" aria-hidden="true" />
                  <span>{sellerLocation}</span>
                  <span aria-hidden="true">·</span>
                </>
              )}
              <T id="seller.memberSince" values={{ date: "" }} />
              <LocalizedDate value={seller.memberSince} dateStyle="medium" />
            </p>

            <div className="mt-3 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-3 text-center text-xs sm:flex sm:gap-6 sm:bg-transparent sm:p-0 sm:text-left sm:text-sm">
              <span>
                <b className="block sm:inline">{seller.rating}</b>{" "}
                <T id="seller.rating" />
              </span>
              <span>
                <b className="block sm:inline">{seller.reviews}</b>{" "}
                <T id="seller.reviews" />
              </span>
              <span>
                <b className="block sm:inline">{seller.responseRate}%</b>{" "}
                <T id="seller.response" />
              </span>
            </div>
          </div>

          <SellerProfileActions sellerId={seller.id} />
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section aria-labelledby="seller-listings-heading">
          <h2 id="seller-listings-heading" className="text-xl font-bold">
            <T id="seller.activeListings" values={{ count: listings.length }} />
          </h2>

          {listings.length ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  seller={seller}
                />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed bg-white p-10 text-center text-sm text-slate-500">
              <T id="seller.noListings" />
            </div>
          )}
        </section>

        <aside aria-labelledby="seller-reviews-heading">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 id="seller-reviews-heading" className="font-bold">
              <T id="seller.recentReviews" />
            </h2>

            <div className="mt-4 space-y-5">
              {reviews.length ? (
                reviews.slice(0, 4).map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex text-amber-500"
                        role="img"
                        aria-label={`${review.rating}/5`}
                      >
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`size-4 ${
                              index < review.rating
                                ? "fill-current"
                                : "text-slate-200"
                            }`}
                            aria-hidden="true"
                          />
                        ))}
                      </div>

                      <span className="text-xs text-slate-400">
                        <LocalizedDate value={review.date} />
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6">{review.comment}</p>
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      {review.reviewerName}
                    </p>

                    {review.sellerReply && (
                      <div className="mt-2 rounded-xl bg-slate-50 p-3 text-xs leading-5">
                        <b>
                          <T id="seller.reply" />
                        </b>{" "}
                        {review.sellerReply}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  <T id="seller.noReviews" />
                </p>
              )}
            </div>

            <SellerReviewForm sellerId={seller.id} />
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function SellerProfilePage(props: SellerProfilePageProps) {
  return (
    <MarketplaceShell>
      <Suspense fallback={<SellerProfileFallback />}>
        <SellerProfileContent {...props} />
      </Suspense>
    </MarketplaceShell>
  );
}
