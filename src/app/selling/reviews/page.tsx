'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Star } from 'lucide-react';

import { LocalizedDate } from '@/components/i18n/t';
import { MarketplaceShell } from '@/components/layout/marketplace-shell';
import { SellingSidebar } from '@/components/selling/selling-sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import { useLocale } from '@/providers/locale-provider';
import { sellerService } from '@/services/seller.service';
import type { Review } from '@/types';

function Stars({ rating, label }: { rating: number; label: string }) {
  return (
    <div className="flex gap-0.5" aria-label={label}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`size-4 ${value <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default function SellerReviews() {
  const { t, locale } = useLocale();
  const { user, hydrated } = useAuth();
  const queryClient = useQueryClient();
  const sellerId = user?.sellerProfile?.sellerId ?? '';
  const [draft, setDraft] = useState<Record<string, string>>({});

  const reviewsQuery = useQuery({
    queryKey: ['selling', 'reviews'],
    queryFn: sellerService.getMyReviews,
    enabled: hydrated && Boolean(sellerId),
  });
  const reputationQuery = useQuery({
    queryKey: ['seller', sellerId, 'reputation'],
    queryFn: () => sellerService.getMyReputation(sellerId),
    enabled: Boolean(sellerId),
  });

  const replyMutation = useMutation({
    mutationFn: ({ reviewId, reply }: { reviewId: string; reply: string }) => sellerService.replyToReview(reviewId, reply),
    onSuccess: (updated) => {
      queryClient.setQueryData(['selling', 'reviews'], (current: Review[] | undefined) =>
        Array.isArray(current) ? current.map((review) => review.id === updated.id ? updated : review) : current,
      );
      setDraft((current) => ({ ...current, [updated.id]: '' }));
      void reputationQuery.refetch();
    },
  });

  const reviews = reviewsQuery.data ?? [];
  const reputation = reputationQuery.data ?? {
    average: reviews.length ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length : 0,
    total: reviews.length,
    positivePercent: reviews.length ? (reviews.filter((review) => review.rating >= 4).length / reviews.length) * 100 : 0,
  };
  const numberLocale = locale === 'pt-BR' ? 'pt-BR' : 'en-US';
  const average = new Intl.NumberFormat(numberLocale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(reputation.average);
  const positive = new Intl.NumberFormat(numberLocale, { maximumFractionDigits: 0 }).format(reputation.positivePercent);

  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
        <div className="mb-5 sm:mb-7">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-700">{t('selling.eyebrow')}</p>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{t('selling.reviews.title')}</h1>
          <p className="mt-1 text-slate-500">{t('selling.reviews.body')}</p>
        </div>

        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <SellingSidebar />
          <div className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">{t('selling.reviews.overall')}</p>
                <p className="mt-2 text-3xl font-black">{average}</p>
                <div className="mt-2"><Stars rating={reputation.average} label={t('seller.stars', { rating: average })} /></div>
              </div>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">{t('selling.reviews.total')}</p>
                <p className="mt-2 text-3xl font-black">{Number(reputation.total).toLocaleString(numberLocale)}</p>
              </div>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">{t('selling.reviews.positive')}</p>
                <p className="mt-2 text-3xl font-black">{positive}%</p>
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="font-black">{t('selling.reviews.feedback')}</h2>

              {(reviewsQuery.isLoading || reputationQuery.isLoading) && (
                <div className="grid min-h-40 place-items-center"><Loader2 className="size-6 animate-spin text-brand-600" /></div>
              )}

              {reviewsQuery.isError && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                  <p className="font-semibold">{t('common.error')}</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => reviewsQuery.refetch()}>{t('common.tryAgain')}</Button>
                </div>
              )}

              {!reviewsQuery.isLoading && !reviewsQuery.isError && reviews.length === 0 && (
                <p className="mt-4 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">{t('seller.noReviews')}</p>
              )}

              {reviews.length > 0 && (
                <div className="mt-4 divide-y">
                  {reviews.map((review) => (
                    <article key={review.id} className="py-5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <b>{review.reviewerName}</b>
                          <div className="mt-1"><Stars rating={review.rating} label={t('seller.stars', { rating: review.rating })} /></div>
                        </div>
                        <time dateTime={review.date} className="text-xs text-slate-400"><LocalizedDate value={review.date} /></time>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-600">{review.comment}</p>

                      {review.sellerReply ? (
                        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">
                          <b>{t('selling.reviews.reply')}</b> {review.sellerReply}
                        </div>
                      ) : (
                        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                          <input
                            value={draft[review.id] ?? ''}
                            onChange={(event) => setDraft((current) => ({ ...current, [review.id]: event.target.value }))}
                            placeholder={t('selling.reviews.replyPlaceholder')}
                            aria-label={t('selling.reviews.replyPlaceholder')}
                            maxLength={2000}
                            className="min-h-11 flex-1 rounded-xl border px-3 text-base sm:text-sm"
                          />
                          <Button
                            type="button"
                            size="sm"
                            disabled={!draft[review.id]?.trim() || replyMutation.isPending}
                            onClick={() => replyMutation.mutate({ reviewId: review.id, reply: draft[review.id].trim() })}
                          >
                            {t('selling.reviews.replyButton')}
                          </Button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </MarketplaceShell>
  );
}
