'use client';

import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';

import { AccountSidebar } from '@/components/account/account-sidebar';
import { MarketplaceShell } from '@/components/layout/marketplace-shell';
import { ListingCard } from '@/components/listings/listing-card';
import { useLocale } from '@/providers/locale-provider';
import { socialService } from '@/services/social.service';

export default function SavedPage() {
  const { t } = useLocale();
  const query = useQuery({
    queryKey: ['saved-listings'],
    queryFn: () => socialService.getSaved(),
  });

  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <AccountSidebar />
          <section>
            <h1 className="text-2xl font-extrabold">{t('account.saved.title')}</h1>
            <p className="mt-1 text-sm text-slate-500">{t('account.saved.body')}</p>

            {query.isLoading ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-80 animate-pulse rounded-2xl bg-slate-100" />
                ))}
              </div>
            ) : query.data?.length ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {query.data.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-3xl border border-dashed p-12 text-center">
                <Heart className="mx-auto size-10 text-slate-300" />
                <h2 className="mt-4 font-bold">{t('account.saved.empty')}</h2>
                <p className="mt-1 text-sm text-slate-500">{t('account.saved.emptyBody')}</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </MarketplaceShell>
  );
}
