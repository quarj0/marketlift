'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Heart, MessageCircle, ShieldCheck, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { ListingCard } from '@/components/listings/listing-card';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/providers/locale-provider';
import { accountService } from '@/services/account.service';

type OverviewStat = {
  icon: LucideIcon;
  label: string;
  value: number;
};

export function AccountOverview() {
  const { t } = useLocale();
  const query = useQuery({
    queryKey: ['account-overview'],
    queryFn: accountService.getOverview,
  });

  if (query.isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3" aria-busy="true">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
        <h2 className="font-black text-rose-900">{t('account.overview.error')}</h2>
        <p className="mt-1 text-sm text-rose-700">{t('account.overview.errorBody')}</p>
        <Button variant="outline" className="mt-4 bg-white" onClick={() => query.refetch()}>
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  const data = query.data;
  const stats: OverviewStat[] = [
    { icon: Heart, label: t('account.overview.saved'), value: data.savedCount },
    { icon: MessageCircle, label: t('account.overview.unread'), value: data.unreadMessages },
    { icon: Star, label: t('account.overview.reviews'), value: data.reviewsCount },
  ];

  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <Icon className="size-5 text-brand-600" />
            <p className="mt-3 text-2xl font-black">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 text-brand-600" />
          <div>
            <h2 className="font-bold">{t('account.overview.good')}</h2>
            <p className="mt-1 text-sm text-slate-500">{t('account.overview.goodBody')}</p>
          </div>
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-black">{t('account.overview.recent')}</h2>
            <p className="text-sm text-slate-500">{t('account.overview.recentBody')}</p>
          </div>
          <Link href="/search" className="text-sm font-bold text-brand-700">
            {t('account.overview.browse')}
          </Link>
        </div>

        {data.recentlyViewed.length ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {data.recentlyViewed.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">
            {t('account.overview.recentEmpty')}
          </div>
        )}
      </section>
    </div>
  );
}
