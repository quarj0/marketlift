'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { AuthRequiredDialog } from '@/components/auth/auth-required-dialog';
import { ReportDialog } from '@/components/feedback/report-dialog';
import { useAuth } from '@/providers/auth-provider';
import { socialService } from '@/services/social.service';

export function SellerProfileActions({ sellerId }: { sellerId: string }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [authAction, setAuthAction] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);

  const followMutation = useMutation({
    mutationFn: () => socialService.toggleFollowSeller(sellerId),
    onSuccess: setFollowing,
  });

  function requireAuth(action: string, callback?: () => void) {
    if (!isAuthenticated) {
      setAuthAction(action);
      return;
    }
    callback?.();
  }

  return (
    <>
      <div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap">
        <Button
          onClick={() =>
            requireAuth('message this seller', () => router.push('/messages'))
          }
        >
          <MessageCircle className="size-4" />
          Message
        </Button>
        <Button
          variant="outline"
          aria-pressed={following}
          loading={followMutation.isPending}
          loadingText="Updating…"
          onClick={() =>
            requireAuth('follow this seller', () => followMutation.mutate())
          }
        >
          <Heart
            className={`size-4 ${following ? 'fill-rose-500 text-rose-500' : ''}`}
          />
          {following ? 'Following' : 'Follow'}
        </Button>
        <ReportDialog targetType="seller" targetId={sellerId} />
      </div>
      <AuthRequiredDialog
        open={Boolean(authAction)}
        onClose={() => setAuthAction(null)}
        action={authAction || 'continue'}
      />
    </>
  );
}
