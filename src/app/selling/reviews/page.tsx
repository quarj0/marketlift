"use client";

import { useState } from "react";
import { Star } from "lucide-react";

import { LocalizedDate } from "@/components/i18n/t";
import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { SellingSidebar } from "@/components/selling/selling-sidebar";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/providers/locale-provider";

const seed = [
  {
    id: "r1",
    name: "Lucas Almeida",
    rating: 5,
    date: "2026-08-14",
    text: "Product matched the description and the seller answered quickly.",
    reply: "Thanks, Lucas! Glad everything went well.",
  },
  {
    id: "r2",
    name: "Ana Souza",
    rating: 4,
    date: "2026-08-02",
    text: "Good communication and easy pickup.",
    reply: "",
  },
  {
    id: "r3",
    name: "Rafael Lima",
    rating: 5,
    date: "2026-07-21",
    text: "Very professional seller. Would buy again.",
    reply: "",
  },
];

export default function SellerReviews() {
  const { t, locale } = useLocale();
  const [reviews, setReviews] = useState(seed);
  const [draft, setDraft] = useState<Record<string, string>>({});

  const average = reviews.length
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : 0;

  const ratingFormatter = new Intl.NumberFormat(
    locale === "pt-BR" ? "pt-BR" : "en-US",
    { minimumFractionDigits: 1, maximumFractionDigits: 1 },
  );

  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
        <div className="mb-5 sm:mb-7">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-700">
            {t("selling.eyebrow")}
          </p>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            {t("selling.reviews.title")}
          </h1>
          <p className="mt-1 text-slate-500">
            {t("selling.reviews.body")}
          </p>
        </div>

        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <SellingSidebar />

          <div className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  {t("selling.reviews.overall")}
                </p>
                <p className="mt-2 text-3xl font-black">
                  {ratingFormatter.format(average)}
                </p>
                <div
                  className="mt-2 flex text-amber-500"
                  aria-label={t("seller.stars", { rating: ratingFormatter.format(average) })}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                      key={value}
                      className="size-4 fill-current"
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  {t("selling.reviews.total")}
                </p>
                <p className="mt-2 text-3xl font-black">
                  {reviews.length.toLocaleString(locale === "pt-BR" ? "pt-BR" : "en-US")}
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  {t("selling.reviews.positive")}
                </p>
                <p className="mt-2 text-3xl font-black">96%</p>
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="font-black">
                {t("selling.reviews.feedback")}
              </h2>

              <div className="mt-4 divide-y">
                {reviews.map((review) => (
                  <article key={review.id} className="py-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <b>{review.name}</b>
                        <div
                          className="mt-1 flex text-amber-500"
                          aria-label={t("seller.stars", { rating: review.rating })}
                        >
                          {Array.from({ length: review.rating }).map((_, index) => (
                            <Star
                              key={index}
                              className="size-4 fill-current"
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                      </div>

                      <time
                        dateTime={review.date}
                        className="text-xs text-slate-400"
                      >
                        <LocalizedDate value={review.date} />
                      </time>
                    </div>

                    {/* Buyer-written content is intentionally never translated. */}
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {review.text}
                    </p>

                    {review.reply ? (
                      <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">
                        <b>{t("selling.reviews.reply")}</b>{" "}
                        {review.reply}
                      </div>
                    ) : (
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <input
                          value={draft[review.id] ?? ""}
                          onChange={(event) =>
                            setDraft((current) => ({
                              ...current,
                              [review.id]: event.target.value,
                            }))
                          }
                          placeholder={t("selling.reviews.replyPlaceholder")}
                          aria-label={t("selling.reviews.replyPlaceholder")}
                          className="min-h-11 flex-1 rounded-xl border px-3 text-base sm:text-sm"
                        />
                        <Button
                          type="button"
                          size="sm"
                          disabled={!draft[review.id]?.trim()}
                          onClick={() => {
                            setReviews((current) =>
                              current.map((item) =>
                                item.id === review.id
                                  ? { ...item, reply: draft[review.id] }
                                  : item,
                              ),
                            );
                            setDraft((current) => ({
                              ...current,
                              [review.id]: "",
                            }));
                          }}
                        >
                          {t("selling.reviews.replyButton")}
                        </Button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </MarketplaceShell>
  );
}
