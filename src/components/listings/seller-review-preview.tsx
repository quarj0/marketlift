"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/providers/locale-provider";
import { socialService } from "@/services/social.service";
import type { Seller } from "@/types";

export function SellerReviewPreview({ seller }: { seller: Seller }) {
  const { t } = useLocale();

  const reviewsQuery = useQuery({
    queryKey: ["seller-reviews", seller.id],
    queryFn: () => socialService.getReviews(seller.id),
  });

  return (
    <section
      className="mt-5 rounded-2xl border bg-white p-5 shadow-sm sm:rounded-3xl sm:p-7"
      aria-labelledby="listing-seller-reviews-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-brand-700">
            {t("listing.reviews.eyebrow")}
          </p>
          <h2
            id="listing-seller-reviews-heading"
            className="mt-1 text-xl font-black sm:text-2xl"
          >
            {t("listing.reviews.title")}
          </h2>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1 font-bold text-slate-900">
              <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
              {seller.rating}
            </span>
            <span aria-hidden="true">·</span>
            <span>{t("listing.reviews.count", { count: seller.reviews })}</span>
          </div>
        </div>

        <Button variant="outline" asChild>
          <Link href={`/seller/${seller.id}#seller-reviews-heading`}>
            {t("listing.reviews.viewAll")}
          </Link>
        </Button>
      </div>

      {reviewsQuery.isLoading ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : reviewsQuery.isError ? (
        <p className="mt-5 text-sm text-slate-500">
          {t("listing.reviews.loadError")}
        </p>
      ) : reviewsQuery.data?.length ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {reviewsQuery.data.slice(0, 4).map((review) => (
            <article key={review.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900">{review.reviewerName}</p>
                  <div
                    className="mt-1 flex text-amber-500"
                    role="img"
                    aria-label={t("listing.reviews.stars", { rating: review.rating })}
                  >
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`size-4 ${
                          index < review.rating ? "fill-current" : "text-slate-200"
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{review.date}</span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">{review.comment}</p>

              {review.sellerReply && (
                <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                  <strong className="text-slate-900">
                    {t("listing.reviews.sellerReply")}
                  </strong>{" "}
                  {review.sellerReply}
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-slate-500">{t("listing.reviews.empty")}</p>
      )}
    </section>
  );
}
