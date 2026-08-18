'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquareText, Star, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { AccountSidebar } from '@/components/account/account-sidebar';
import { MarketplaceShell } from '@/components/layout/marketplace-shell';
import { Button } from '@/components/ui/button';
import { accountService } from '@/services/account.service';

function Stars({ rating }: { rating: number }) {
  return <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>{Array.from({ length: 5 }).map((_, index) => <Star key={index} className={`size-4 ${index < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />)}</div>;
}

export default function ReviewsPage() {
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const reviewsQuery = useQuery({ queryKey: ['account', 'reviews'], queryFn: accountService.getMyReviews });
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
        <div className="mb-5 sm:mb-7"><h1 className="text-2xl font-black tracking-tight sm:text-3xl">Reviews</h1><p className="mt-1 text-slate-500">See feedback you have left for sellers after marketplace interactions.</p></div>
        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <AccountSidebar />
          <section>
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div><p className="font-bold">Your review history</p><p className="mt-1 text-sm text-slate-500">Reviews help other buyers understand what it is like to deal with a seller.</p></div>
              <Link href="/search"><Button variant="outline">Browse marketplace</Button></Link>
            </div>

            {reviewsQuery.isLoading && <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-44 animate-pulse rounded-2xl border bg-slate-100" />)}</div>}

            {reviewsQuery.isError && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center"><h2 className="font-bold text-rose-900">We could not load your reviews</h2><p className="mt-1 text-sm text-rose-700">Please try again.</p><Button variant="outline" className="mt-4" onClick={() => reviewsQuery.refetch()}>Try again</Button></div>}

            {reviewsQuery.data?.length === 0 && (
              <div className="rounded-2xl border border-dashed bg-white px-6 py-14 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-50"><MessageSquareText className="size-6 text-brand-700" /></div>
                <h2 className="mt-4 text-lg font-extrabold">No reviews yet</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">After completing a deal with a seller, you will be able to leave feedback and find it here.</p>
                <Link href="/search"><Button className="mt-5">Explore listings</Button></Link>
              </div>
            )}

            <div className="space-y-4">
              {reviewsQuery.data?.map((review) => (
                <article key={review.id} className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2"><h2 className="font-extrabold">{review.sellerName}</h2><span className="text-xs text-slate-400">•</span><span className="text-xs font-medium text-slate-500">{new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span></div>
                      {review.listingTitle && <p className="mt-1 text-sm text-slate-500">For: {review.listingTitle}</p>}
                      <div className="mt-3"><Stars rating={review.rating} /></div>
                    </div>
                    <Link href={`/seller/${review.sellerId}`} className="text-sm font-bold text-brand-700 hover:text-brand-800">View seller</Link>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-700">{review.comment}</p>

                  {review.sellerReply && <div className="mt-4 rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Seller reply</p><p className="mt-1 text-sm leading-6 text-slate-700">{review.sellerReply}</p></div>}

                  <div className="mt-5 flex items-center justify-between border-t pt-4">
                    <p className="text-xs text-slate-400">Review ID: {review.id}</p>
                    {confirmDelete === review.id ? (
                      <div className="flex items-center gap-2"><span className="text-xs font-semibold text-rose-700">Delete this review?</span><Button size="sm" variant="destructive" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(review.id)}>{deleteMutation.isPending ? 'Deleting...' : 'Delete'}</Button><Button size="sm" variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button></div>
                    ) : (
                      <Button size="sm" variant="ghost" className="text-slate-500" onClick={() => setConfirmDelete(review.id)}><Trash2 className="size-4" /> Delete</Button>
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
