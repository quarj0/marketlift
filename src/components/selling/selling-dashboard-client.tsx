'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  Eye,
  FileText,
  MessageCircle,
  Plus,
  ShieldAlert,
  Store,
} from 'lucide-react';
import { sellingService } from '@/services/selling.service';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/providers/locale-provider';
import { releaseFeatures } from '@/lib/release-features';

export function SellingDashboardClient() {
  const { t, tr, locale } = useLocale();
  const query = useQuery({
    queryKey: ['selling-dashboard'],
    queryFn: sellingService.getDashboard,
  });

  if (query.isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-busy="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl border bg-white"
          />
        ))}
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
        <AlertCircle className="mx-auto size-8 text-rose-600" />
        <h2 className="mt-3 font-black text-rose-900">{t('selling.dashboard.error')}</h2>
        <p className="mt-1 text-sm text-rose-700">{t('selling.dashboard.errorBody')}</p>
        <Button
          variant="outline"
          className="mt-4 bg-white"
          onClick={() => query.refetch()}
        >
          {t('common.tryAgain')}
        </Button>
      </div>
    );
  }

  const data = query.data;
  const stats = [
    [t('selling.dashboard.active'), data.active, Store],
    [t('selling.dashboard.drafts'), data.drafts, FileText],
    [t('selling.dashboard.underReview'), data.underReview, ShieldAlert],
    [t('selling.dashboard.views'), data.views.toLocaleString(locale === 'pt-BR' ? 'pt-BR' : 'en-US'), Eye],
    [t('selling.dashboard.messages'), data.messages, MessageCircle],
  ] as const;
  const usage =
    data.plan.limit > 0 ? Math.min(100, (data.plan.used / data.plan.limit) * 100) : 0;

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {stats.map(([label, value, Icon]) => (
          <article key={label} className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold leading-5 text-slate-500 sm:text-sm">
                {label}
              </span>
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <Icon className="size-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-black tracking-tight">{value}</p>
          </article>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="flex items-start justify-between gap-3 border-b p-4 sm:items-center sm:p-5">
            <div>
              <h2 className="text-lg font-black sm:text-xl">{t('selling.dashboard.recent')}</h2>
              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                {t('selling.dashboard.recentBody')}
              </p>
            </div>
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="/selling/listings/new">
                <Plus className="size-4" />
                {t('selling.addListing')}
              </Link>
            </Button>
          </div>

          {data.recentListings.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Store className="mx-auto size-9 text-slate-300" />
              <h3 className="mt-3 font-black">{t('selling.dashboard.empty')}</h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                {t('selling.dashboard.emptyBody')}
              </p>
              <Button asChild className="mt-4">
                <Link href="/selling/listings/new">{t('selling.dashboard.create')}</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {data.recentListings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/selling/listings/${listing.id}/edit`}
                  className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 p-4 hover:bg-slate-50 sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:items-center"
                >
                  <Image
                    src={listing.images[0]}
                    alt=""
                    width={72}
                    height={72}
                    unoptimized
                    className="size-[72px] rounded-xl object-cover sm:size-16"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="min-w-0 flex-1 truncate text-sm font-black sm:text-base">
                        {listing.title}
                      </p>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black capitalize sm:hidden">
                        {t(`selling.status.${listing.status}`)}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {t('selling.dashboard.viewsEnquiries', { views: listing.views, inquiries: listing.inquiries })}
                    </p>
                  </div>
                  <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold capitalize sm:inline-flex">
                    {t(`selling.status.${listing.status}`)}
                  </span>
                </Link>
              ))}
            </div>
          )}

          <div className="border-t p-3 sm:hidden">
            <Button asChild className="w-full">
              <Link href="/selling/listings/new">
                <Plus className="size-4" />
                {t('selling.addListing')}
              </Link>
            </Button>
          </div>
        </section>

        <aside className="h-fit rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-500">{t('selling.dashboard.plan')}</p>
              <h2 className="mt-1 text-2xl font-black">{tr(data.plan.name)}</h2>
            </div>
            <Store className="size-6 text-brand-700" />
          </div>
          <div className="mt-5 flex items-end justify-between gap-3">
            <p className="text-sm font-bold">{t('selling.dashboard.capacity')}</p>
            <p className="text-sm text-slate-500">
              {data.plan.used} / {data.plan.limit}
            </p>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={data.plan.limit}
            aria-valuenow={data.plan.used}
          >
            <div
              className="h-full rounded-full bg-brand-600"
              style={{ width: `${usage}%` }}
            />
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {t('selling.dashboard.planBody')}
          </p>
          {releaseFeatures.payments?<Button asChild variant="outline" className="mt-5 w-full"><Link href="/selling/plan">{t('selling.dashboard.managePlan')}</Link></Button>:<Button variant="outline" className="mt-5 w-full" disabled>{t('common.upcoming')}</Button>}
        </aside>
      </div>
    </div>
  );
}
