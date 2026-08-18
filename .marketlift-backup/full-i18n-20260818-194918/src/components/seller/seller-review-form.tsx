'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { AuthRequiredDialog } from '@/components/auth/auth-required-dialog';
import { SuccessNotice } from '@/components/feedback/async-states';
import { socialService } from '@/services/social.service';
import { useAuth } from '@/providers/auth-provider';

export function SellerReviewForm({ sellerId }: { sellerId: string }) {
  const { isAuthenticated, user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => socialService.addReview({ sellerId, reviewerName: user?.name || 'Marketlift user', rating, comment }),
    onSuccess: () => {
      setDone(true);
      setRating(0);
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['seller-reviews', sellerId] });
    },
  });

  function startReview() {
    if (!isAuthenticated) setAuthOpen(true);
  }

  if (!isAuthenticated) {
    return <><Button variant="outline" className="w-full" onClick={startReview}>Write a review</Button><AuthRequiredDialog open={authOpen} onClose={() => setAuthOpen(false)} action="review this seller" /></>;
  }


  return (
    <div className="mt-5 border-t pt-5">
      <h3 className="font-black">Leave a review</h3>
      <p className="mt-1 text-xs leading-5 text-slate-500">Only review sellers you have genuinely interacted with. Backend eligibility checks will be enforced in production.</p>
      {done && <div className="mt-4"><SuccessNotice title="Review submitted" description="Thanks for sharing your experience." /></div>}
      <div className="mt-4 flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" role="radio" aria-checked={rating === value} aria-label={`${value} star${value > 1 ? 's' : ''}`} onClick={() => { setDone(false); setRating(value); }} className="grid size-11 place-items-center rounded-xl hover:bg-amber-50 focus-visible:ring-2 focus-visible:ring-amber-500"><Star className={`size-6 ${value <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} /></button>)}
      </div>
      <label className="mt-3 block text-sm font-bold">Feedback
        <textarea value={comment} onChange={(event) => { setDone(false); setComment(event.target.value); }} maxLength={700} placeholder="What was your experience with this seller?" className="mt-2 min-h-28 w-full rounded-xl border p-3 text-base outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:text-sm" />
      </label>
      <div className="mt-2 flex items-center justify-between gap-3"><span className="text-xs text-slate-400">{comment.length}/700</span><Button size="sm" disabled={rating === 0 || comment.trim().length < 10} loading={mutation.isPending} loadingText="Submitting…" onClick={() => mutation.mutate()}>Submit review</Button></div>
    </div>
  );
}
