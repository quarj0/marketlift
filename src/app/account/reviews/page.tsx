'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquareText, Star, Trash2 } from 'lucide-react';

import { AccountSidebar } from '@/components/account/account-sidebar';
import { LocalizedDate } from '@/components/i18n/t';
import { MarketplaceShell } from '@/components/layout/marketplace-shell';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/providers/locale-provider';
import { accountService } from '@/services/account.service';

function Stars({ rating, label }: { rating: number; label: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={label}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`size-4 ${index < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const reviewsQuery = useQuery({
    queryKey: ['account', 'reviews'],
    queryFn: accountService.getMyReviews,
  });

  const deleteMutation = useMutation({
    mutationFn: accountService.deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', 'reviews'] });
      setConfirmDelete(null);
    },
  });

  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
        <div className="mb-5 sm:mb-7">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{t('account.reviews.title')}</h1>
          <p className="mt-1 text-slate-500">{t('account.reviews.body')}</p>
        </div>

        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <AccountSidebar />
          <section>
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold">{t('account.reviews.history')}</p>
                <p className="mt-1 text-sm text-slate-500">{t('account.reviews.historyBody')}</p>
              </div>
              <Link href="/search"><Button variant="outline">{t('account.reviews.browse')}</Button></Link>
            </div>

            {reviewsQuery.isLoading && (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-44 animate-pulse rounded-2xl border bg-slate-100" />
                ))}
              </div>
            )}

            {reviewsQuery.isError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
                <h2 className="font-bold text-rose-900">{t('account.reviews.loadError')}</h2>
                <p className="mt-1 text-sm text-rose-700">{t('account.overview.errorBody')}</p>
                <Button variant="outline" className="mt-4" onClick={() => reviewsQuery.refetch()}>
                  {t('common.tryAgain')}
                </Button>
              </div>
            )}

            {reviewsQuery.data?.length === 0 && (
              <div className="rounded-2xl border border-dashed bg-white px-6 py-14 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-50">
                  <MessageSquareText className="size-6 text-brand-700" />
                </div>
                <h2 className="mt-4 text-lg font-extrabold">{t('account.reviews.empty')}</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{t('account.reviews.emptyBody')}</p>
                <Link href="/search"><Button className="mt-5">{t('account.reviews.explore')}</Button></Link>
              </div>
            )}

            <div className="space-y-4">
              {reviewsQuery.data?.map((review) => (
                <article key={review.id} className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-extrabold">{review.sellerName}</h2>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-medium text-slate-500">
<LocalizedDate value={review.date} />
                        </span>
                      </div>
                      {review.listingTitle && (
                        <p className="mt-1 text-sm text-slate-500">
                          {t('account.reviews.for', { listing: review.listingTitle })}
                        </p>
                      )}
                      <div className="mt-3">
                        <Stars rating={review.rating} label={t('account.reviews.stars', { rating: review.rating })} />
                      </div>
                    </div>
                    <Link href={`/seller/${review.sellerId}`} className="text-sm font-bold text-brand-700 hover:text-brand-800">
                      {t('account.reviews.viewSeller')}
                    </Link>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-700">{review.comment}</p>

                  {review.sellerReply && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t('account.reviews.sellerReply')}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-700">{review.sellerReply}</p>
                    </div>
                  )}

                  <div className="mt-5 flex items-center justify-between border-t pt-4">
                    <p className="text-xs text-slate-400">{t('account.reviews.id', { id: review.id })}</p>
                    {confirmDelete === review.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-rose-700">{t('account.reviews.confirmDelete')}</span>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={deleteMutation.isPending}
                          onClick={() => deleteMutation.mutate(review.id)}
                        >
                          {deleteMutation.isPending ? t('common.deleting') : t('common.delete')}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(null)}>{t('common.cancel')}</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" className="text-slate-500" onClick={() => setConfirmDelete(review.id)}>
                        <Trash2 className="size-4" /> {t('common.delete')}
                      </Button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </MarketplaceShell>
  );
}
