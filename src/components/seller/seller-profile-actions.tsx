'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Flag, Heart, MessageCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

import { AuthRequiredDialog } from '@/components/auth/auth-required-dialog';
import { ReportDialog } from '@/components/feedback/report-dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import { useLocale } from '@/providers/locale-provider';
import { socialService } from '@/services/social.service';

export function SellerProfileActions({ sellerId }: { sellerId: string }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { t, locale } = useLocale();
  const [authAction, setAuthAction] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const isOwnProfile = Boolean(user?.sellerProfile?.sellerId === sellerId);

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

  const ownProfileText = locale === 'pt-BR'
    ? 'Estas ações não estão disponíveis no seu próprio perfil de vendedor.'
    : 'These actions are not available on your own seller profile.';

  return (
    <>
      <div className="w-full sm:w-auto">
        <div className="grid gap-2 sm:flex sm:flex-wrap">
          <Button
            disabled={isOwnProfile}
            title={isOwnProfile ? ownProfileText : undefined}
            onClick={() => requireAuth('message this seller', () => router.push('/messages'))}
          >
            <MessageCircle className="size-4" />
            {t('seller.message')}
          </Button>

          <Button
            variant="outline"
            aria-pressed={following}
            disabled={isOwnProfile}
            title={isOwnProfile ? ownProfileText : undefined}
            loading={followMutation.isPending}
            loadingText={t('seller.update')}
            onClick={() => requireAuth('follow this seller', () => followMutation.mutate())}
          >
            <Heart className={`size-4 ${following ? 'fill-rose-500 text-rose-500' : ''}`} />
            {following ? t('seller.following') : t('seller.follow')}
          </Button>

          {isOwnProfile ? (
            <Button variant="ghost" disabled title={ownProfileText}>
              <Flag className="size-4" />
              {t('report.trigger')}
            </Button>
          ) : (
            <ReportDialog targetType="seller" targetId={sellerId} />
          )}
        </div>

        {isOwnProfile && (
          <p className="mt-2 max-w-sm text-xs text-slate-500" role="status">
            {ownProfileText}
          </p>
        )}

        {followMutation.isError && !isOwnProfile && (
          <p className="mt-2 max-w-sm rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700" role="alert">
            {followMutation.error instanceof Error
              ? followMutation.error.message
              : locale === 'pt-BR'
                ? 'Não foi possível atualizar este acompanhamento.'
                : 'Unable to update this follow.'}
          </p>
        )}
      </div>

      <AuthRequiredDialog
        open={Boolean(authAction)}
        onClose={() => setAuthAction(null)}
        action={authAction || 'continue'}
      />
    </>
  );
}
