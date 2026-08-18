'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AuthRequiredDialog } from '@/components/auth/auth-required-dialog';
import { SuccessNotice } from '@/components/feedback/async-states';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import { useLocale } from '@/providers/locale-provider';
import { socialService } from '@/services/social.service';

export function SellerReviewForm({ sellerId }: { sellerId: string }) {
  const { isAuthenticated, user } = useAuth();
  const { t } = useLocale();
  const [authOpen, setAuthOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      socialService.addReview({
        sellerId,
        reviewerName: user?.name || 'Marketlift user',
        rating,
        comment,
      }),
    onSuccess: () => {
      setDone(true);
      setRating(0);
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['seller-reviews', sellerId] });
    },
  });

  if (!isAuthenticated) {
    return (
      <>
        <Button variant="outline" className="w-full" onClick={() => setAuthOpen(true)}>
          {t('seller.review.write')}
        </Button>
        <AuthRequiredDialog open={authOpen} onClose={() => setAuthOpen(false)} action="review this seller" />
      </>
    );
  }

  return (
    <div className="mt-5 border-t pt-5">
      <h3 className="font-black">{t('seller.review.leave')}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-500">{t('seller.review.eligibility')}</p>

      {done && (
        <div className="mt-4">
          <SuccessNotice title={t('seller.review.submitted')} description={t('seller.review.thanks')} />
        </div>
      )}

      <div className="mt-4 flex gap-1" role="radiogroup" aria-label={t('seller.review.rating')}>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={t(value === 1 ? 'seller.review.star' : 'seller.review.stars', { value })}
            onClick={() => {
              setDone(false);
              setRating(value);
            }}
            className="grid size-11 place-items-center rounded-xl hover:bg-amber-50 focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <Star className={`size-6 ${value <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} aria-hidden="true" />
          </button>
        ))}
      </div>

      <label className="mt-3 block text-sm font-bold">
        {t('seller.review.feedback')}
        <textarea
          value={comment}
          onChange={(event) => {
            setDone(false);
            setComment(event.target.value);
          }}
          maxLength={700}
          placeholder={t('seller.review.placeholder')}
          className="mt-2 min-h-28 w-full rounded-xl border p-3 text-base outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 sm:text-sm"
        />
      </label>

      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-xs text-slate-400">{comment.length}/700</span>
        <Button
          size="sm"
          disabled={rating === 0 || comment.trim().length < 10}
          loading={mutation.isPending}
          loadingText={t('seller.review.submitting')}
          onClick={() => mutation.mutate()}
        >
          {t('seller.review.submit')}
        </Button>
      </div>
    </div>
  );
}
