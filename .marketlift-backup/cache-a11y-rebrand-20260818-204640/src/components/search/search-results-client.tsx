'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Grid2X2, List, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { listingService } from '@/services/listing.service';
import { sellers, categories, brazilLocations } from '@/mocks/data';
import { ListingCard } from '@/components/listings/listing-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/providers/locale-provider';
import type { ListingCondition, SearchFilters, SellerType } from '@/types';

const sellerMap = new Map(sellers.map((seller) => [seller.id, seller]));
const toNum = (value: string | null) => value && !Number.isNaN(Number(value)) ? Number(value) : undefined;

function useFilters(): SearchFilters {
  const params = useSearchParams();
  return {
    q: params.get('q') || '',
    category: params.get('category') || '',
    state: params.get('state') || '',
    city: params.get('city') || '',
    district: params.get('district') || '',
    minPrice: toNum(params.get('minPrice')),
    maxPrice: toNum(params.get('maxPrice')),
    condition: (params.get('condition') || '') as ListingCondition | '',
    sellerType: (params.get('sellerType') || '') as SellerType | '',
    verifiedOnly: params.get('verified') === '1',
    dateListed: (params.get('date') || '') as SearchFilters['dateListed'],
    sort: (params.get('sort') || 'relevant') as SearchFilters['sort'],
  };
}

export function SearchResultsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useFilters();
  const { t, categoryName, locale } = useLocale();
  const [mobileFilters, setMobileFilters] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['listings', filters],
    queryFn: () => listingService.getListings(filters),
  });

  const selectedState = brazilLocations.find((state) => state.code === filters.state);
  const cities = selectedState?.cities ?? [];

  function update(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  const clear = () => router.replace(pathname);
  const locationLabel = filters.city || selectedState?.name || t('search.brazil');
  const count = data.length.toLocaleString(locale === 'pt-BR' ? 'pt-BR' : 'en-US');
  const countText = t(data.length === 1 ? 'search.countOne' : 'search.count', { count, location: locationLabel });

  const panel = (
    <div className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-semibold">{t('search.keyword')}</label>
        <Input defaultValue={filters.q} key={`q-${filters.q}`} placeholder={t('search.what')} onKeyDown={(event) => { if (event.key === 'Enter') update({ q: event.currentTarget.value }); }} />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold">{t('search.category')}</label>
        <select value={filters.category} onChange={(event) => update({ category: event.target.value })} className="h-11 w-full rounded-xl border bg-white px-3 text-sm">
          <option value="">{t('search.allCategories')}</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{categoryName(category.id, category.name)}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-2 block text-sm font-semibold">{t('search.state')}</label>
          <select value={filters.state} onChange={(event) => update({ state: event.target.value, city: undefined })} className="h-11 w-full rounded-xl border bg-white px-3 text-sm">
            <option value="">{t('search.all')}</option>
            {brazilLocations.map((state) => <option key={state.code} value={state.code}>{state.code}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">{t('search.city')}</label>
          <select disabled={!filters.state} value={filters.city} onChange={(event) => update({ city: event.target.value })} className="h-11 w-full rounded-xl border bg-white px-3 text-sm disabled:bg-slate-50">
            <option value="">{t('search.allCities')}</option>
            {cities.map((city) => <option key={city} value={city}>{city}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold">{t('search.neighborhood')}</label>
        <Input defaultValue={filters.district} key={`d-${filters.district}`} placeholder={t('selling.new.districtPlaceholder')} onKeyDown={(event) => { if (event.key === 'Enter') update({ district: event.currentTarget.value }); }} />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold">{t('search.priceRange')}</label>
        <div className="grid grid-cols-2 gap-2">
          <Input inputMode="numeric" defaultValue={filters.minPrice} key={`min-${filters.minPrice}`} placeholder={t('search.min')} onBlur={(event) => update({ minPrice: event.target.value })} />
          <Input inputMode="numeric" defaultValue={filters.maxPrice} key={`max-${filters.maxPrice}`} placeholder={t('search.max')} onBlur={(event) => update({ maxPrice: event.target.value })} />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold">{t('search.condition')}</label>
        <select value={filters.condition} onChange={(event) => update({ condition: event.target.value })} className="h-11 w-full rounded-xl border bg-white px-3 text-sm">
          <option value="">{t('search.anyCondition')}</option>
          <option value="New">{t('search.condition.new')}</option>
          <option value="Like new">{t('search.condition.likeNew')}</option>
          <option value="Used">{t('search.condition.used')}</option>
        </select>
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold">{t('search.sellerType')}</label>
        <select value={filters.sellerType} onChange={(event) => update({ sellerType: event.target.value })} className="h-11 w-full rounded-xl border bg-white px-3 text-sm">
          <option value="">{t('search.anySeller')}</option>
          <option value="individual">{t('search.individual')}</option>
          <option value="business">{t('search.business')}</option>
        </select>
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold">{t('search.dateListed')}</label>
        <select value={filters.dateListed} onChange={(event) => update({ date: event.target.value })} className="h-11 w-full rounded-xl border bg-white px-3 text-sm">
          <option value="">{t('search.anyTime')}</option>
          <option value="today">{t('search.today')}</option>
          <option value="week">{t('search.last7')}</option>
          <option value="month">{t('search.last30')}</option>
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={!!filters.verifiedOnly} onChange={(event) => update({ verified: event.target.checked ? '1' : undefined })} className="size-4 accent-brand-600" />
        {t('search.verifiedOnly')}
      </label>
      <Button variant="outline" className="w-full" onClick={clear}><RotateCcw className="size-4" />{t('search.reset')}</Button>
    </div>
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{t('search.resultsTitle')}</h1>
          <p className="mt-1 text-sm text-slate-500">{isLoading ? t('search.searching') : countText}</p>
        </div>
        <Button variant="outline" className="lg:hidden" onClick={() => setMobileFilters(true)}><SlidersHorizontal className="size-4" />{t('search.filters')}</Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden self-start rounded-2xl border bg-white p-5 lg:sticky lg:top-32 lg:block">
          <div className="mb-5 flex items-center justify-between"><h2 className="font-bold">{t('search.filters')}</h2><button type="button" onClick={clear} className="text-xs font-semibold text-brand-700">{t('search.clear')}</button></div>
          {panel}
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">{isLoading ? t('common.loading') : t('search.showing', { count })}</p>
            <div className="flex items-center gap-2">
              <div className="hidden rounded-xl border p-1 sm:flex">
                <button type="button" aria-pressed={view === 'grid'} onClick={() => setView('grid')} className={`rounded-lg p-2 ${view === 'grid' ? 'bg-slate-100' : ''}`} aria-label={t('search.grid')}><Grid2X2 className="size-4" /></button>
                <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')} className={`rounded-lg p-2 ${view === 'list' ? 'bg-slate-100' : ''}`} aria-label={t('search.list')}><List className="size-4" /></button>
              </div>
              <select value={filters.sort} onChange={(event) => update({ sort: event.target.value })} className="h-10 rounded-xl border bg-white px-3 text-sm">
                <option value="relevant">{t('search.sort.relevant')}</option>
                <option value="newest">{t('search.sort.newest')}</option>
                <option value="price_asc">{t('search.sort.lowest')}</option>
                <option value="price_desc">{t('search.sort.highest')}</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="overflow-hidden rounded-2xl border bg-white"><div className="aspect-[4/3] animate-pulse bg-slate-100" /><div className="space-y-3 p-4"><div className="h-6 w-1/3 animate-pulse rounded bg-slate-100" /><div className="h-4 animate-pulse rounded bg-slate-100" /><div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" /></div></div>)}</div>
          ) : isError ? (
            <div className="rounded-2xl border bg-white p-10 text-center"><h2 className="text-xl font-bold">{t('search.loadError')}</h2><p className="mt-2 text-slate-500">{t('search.loadErrorBody')}</p><Button className="mt-5" onClick={() => refetch()}>{t('common.retry')}</Button></div>
          ) : data.length ? (
            <div className={view === 'grid' ? 'grid grid-cols-2 gap-3 md:grid-cols-3' : 'grid gap-3'}>{data.map((listing) => <ListingCard key={listing.id} listing={listing} seller={sellerMap.get(listing.sellerId)} variant={view} />)}</div>
          ) : (
            <div className="rounded-2xl border bg-white p-10 text-center"><h2 className="text-xl font-bold">{t('search.noResults')}</h2><p className="mt-2 text-slate-500">{t('search.noResultsBody')}</p><Button variant="outline" className="mt-5" onClick={clear}>{t('search.clearFilters')}</Button></div>
          )}
        </section>
      </div>

      {mobileFilters && (
        <div className="fixed inset-0 z-[100] bg-slate-950/40 lg:hidden">
          <button type="button" className="absolute inset-0" onClick={() => setMobileFilters(false)} aria-label={t('search.closeFilters')} />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-8">
            <div className="mb-5 flex items-center justify-between">
              <div><h2 className="text-lg font-bold">{t('search.filters')}</h2><p className="text-xs text-slate-500">{t('search.refine')}</p></div>
              <Button variant="ghost" size="sm" onClick={() => setMobileFilters(false)} aria-label={t('search.closeFilters')}><X className="size-5" /></Button>
            </div>
            {panel}
            <Button className="mt-5 w-full" onClick={() => setMobileFilters(false)}>{t('search.showResults', { count })}</Button>
          </div>
        </div>
      )}
    </main>
  );
}
