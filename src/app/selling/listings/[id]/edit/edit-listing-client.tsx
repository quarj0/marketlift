'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ImagePlus, Loader2, RefreshCw } from 'lucide-react';

import { LocationFields } from '@/components/location/location-fields';
import { MarketplaceShell } from '@/components/layout/marketplace-shell';
import { SellingSidebar } from '@/components/selling/selling-sidebar';
import {
  CategoryFields,
  validateCategoryAttributes,
  type CategoryFieldErrors,
} from '@/components/selling/category-fields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/providers/locale-provider';
import { useMarket } from '@/providers/market-provider';
import { categoryService } from '@/services/category.service';
import { sellingService } from '@/services/selling.service';
import type { ListingAttributes, ListingCondition } from '@/types';

export function EditListingClient() {
  const { t, tr } = useLocale();
  const { market } = useMarket();
  const params = useParams<{ id: string }>();
  const listingId = params.id;
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: 0,
    condition: 'Used' as ListingCondition,
    negotiable: false,
    stateName: '',
    stateCode: '',
    city: '',
    district: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });
  const [attributes, setAttributes] = useState<ListingAttributes>({});
  const [attributeErrors, setAttributeErrors] = useState<CategoryFieldErrors>({});
  const [replacementPhotos, setReplacementPhotos] = useState<File[]>([]);
  const [saved, setSaved] = useState(false);

  const listingQuery = useQuery({
    queryKey: ['selling', 'listing', listingId],
    queryFn: () => sellingService.getListing(listingId),
    enabled: Boolean(listingId),
  });
  const listing = listingQuery.data;

  const categoryQuery = useQuery({
    queryKey: ['category-configuration', listing?.category],
    queryFn: () => categoryService.getConfiguration(listing?.category ?? ''),
    enabled: Boolean(listing?.category),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (!listing) return;
    const frame = window.requestAnimationFrame(() => {
      setForm({
        title: listing.title,
        description: listing.description,
        price: listing.price,
        condition: listing.condition ?? 'Used',
        negotiable: Boolean(listing.negotiable),
        stateName: listing.location.state || '',
        stateCode: listing.location.stateCode || '',
        city: listing.location.city || '',
        district: listing.location.district || '',
        latitude: listing.location.latitude,
        longitude: listing.location.longitude,
      });
      setAttributes(listing.attributes ?? {});
    });
    return () => window.cancelAnimationFrame(frame);
  }, [listing]);

  const mutation = useMutation({
    mutationFn: () => {
      if (!listing || !categoryQuery.data) throw new Error('Listing data is unavailable.');
      return sellingService.updateListing(listing.id, {
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: listing.category,
        condition: categoryQuery.data.condition.enabled ? form.condition : undefined,
        negotiable: form.negotiable,
        location: {
          countryCode: listing.location.countryCode || market.code,
          state: form.stateName || listing.location.state || form.stateCode,
          stateCode: form.stateCode,
          city: form.city.trim(),
          district: form.district.trim(),
          latitude: form.latitude,
          longitude: form.longitude,
        },
        images: replacementPhotos.length ? replacementPhotos : undefined,
        attributes,
        categorySchemaVersion: categoryQuery.data.schemaVersion,
      });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['selling', 'listing', listingId], updated);
      void queryClient.invalidateQueries({ queryKey: ['selling', 'listings'] });
      setReplacementPhotos([]);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    },
  });

  const save = () => {
    if (!categoryQuery.data) return;
    const errors = validateCategoryAttributes(categoryQuery.data, attributes, t, tr);
    setAttributeErrors(errors);
    if (Object.keys(errors).length) return;
    if (!form.title.trim() || form.title.trim().length < 8 || !form.description.trim() || !form.city.trim() || !form.district.trim()) return;
    mutation.mutate();
  };

  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
        <div className="mb-5 sm:mb-7">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-700">{t('selling.eyebrow')}</p>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{t('selling.edit.title')}</h1>
          <p className="mt-1 text-slate-500">{t('selling.edit.body')}</p>
        </div>

        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <SellingSidebar />

          {listingQuery.isLoading ? (
            <section className="grid min-h-72 place-items-center rounded-2xl border bg-white"><Loader2 className="size-6 animate-spin text-brand-600" /></section>
          ) : listingQuery.isError || !listing ? (
            <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
              <p className="font-semibold text-rose-800">{t('common.error')}</p>
              <Button variant="outline" className="mt-4" onClick={() => listingQuery.refetch()}>{t('common.tryAgain')}</Button>
            </section>
          ) : (
            <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-bold">{t('selling.edit.titleLabel')}</span>
                  <Input value={form.title} maxLength={90} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
                </label>
                <label>
                  <span className="mb-1.5 block text-sm font-bold">{`${(categoryQuery.data?.pricing.label ? tr(categoryQuery.data.pricing.label) : t('selling.edit.price')).replace(/\s*\(R\$\)/gi, '')} (${market.currencySymbol})`}</span>
                  <Input type="number" min={0} step="0.01" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: Number(event.target.value) }))} />
                </label>
                {categoryQuery.data?.condition.enabled && (
                  <label>
                    <span className="mb-1.5 block text-sm font-bold">{t('selling.edit.condition')}</span>
                    <select className="h-11 w-full rounded-xl border bg-white px-3 text-sm" value={form.condition} onChange={(event) => setForm((current) => ({ ...current, condition: event.target.value as ListingCondition }))}>
                      <option value="Used">{t('search.condition.used')}</option>
                      <option value="Like new">{t('search.condition.likeNew')}</option>
                      <option value="New">{t('search.condition.new')}</option>
                    </select>
                  </label>
                )}
                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-bold">{t('selling.edit.description')}</span>
                  <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="min-h-40 w-full rounded-xl border p-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                </label>
                <label className="flex items-center gap-3 sm:col-span-2">
                  <input type="checkbox" checked={form.negotiable} onChange={(event) => setForm((current) => ({ ...current, negotiable: event.target.checked }))} className="size-5 accent-brand-600" />
                  <span className="text-sm font-semibold">{t('selling.new.priceNegotiable')}</span>
                </label>
              </div>

              <div className="mt-8 border-t pt-6">
                <h2 className="text-lg font-black">{t('selling.new.step.location')}</h2>
                <div className="mt-4">
                  <LocationFields
                    value={{ countryCode: listing.location.countryCode || market.code, state: form.stateName, stateCode: form.stateCode, city: form.city, district: form.district, latitude: form.latitude, longitude: form.longitude }}
                    onChange={(location) => setForm((current) => ({ ...current, stateName: location.state || location.stateCode, stateCode: location.stateCode, city: location.city, district: location.district, latitude: location.latitude, longitude: location.longitude }))}
                    labels={{
                      region: t('search.region'),
                      state: t('selling.new.state'),
                      city: t('selling.edit.city'),
                      district: t('selling.edit.neighborhood'),
                    }}
                    placeholders={{ city: t('selling.edit.city'), district: t('selling.edit.neighborhood') }}
                    countryCode={listing.location.countryCode || market.code}
                  />
                </div>
              </div>

              <div className="mt-8 border-t pt-6">
                <h2 className="text-lg font-black">{t('selling.edit.vehicle')}</h2>
                {categoryQuery.isLoading ? (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">{[1, 2, 3, 4].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}</div>
                ) : categoryQuery.isError || !categoryQuery.data ? (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-semibold text-red-800">{t('selling.edit.vehicleError')}</p>
                    <Button type="button" variant="outline" className="mt-3" onClick={() => categoryQuery.refetch()}><RefreshCw className="size-4" /> {t('common.retry')}</Button>
                  </div>
                ) : (
                  <>
                    <p className="mt-1 text-sm text-slate-500">{tr(categoryQuery.data.description)}</p>
                    <div className="mt-4">
                      <CategoryFields config={categoryQuery.data} values={attributes} errors={attributeErrors} onChange={(fieldId, value) => {
                        setAttributes((current) => ({ ...current, [fieldId]: value }));
                        setSaved(false);
                      }} />
                    </div>
                  </>
                )}
              </div>

              <div className="mt-8 border-t pt-6">
                <h2 className="text-lg font-black">{t('selling.new.step.photos')}</h2>
                {listing.images.length > 0 && replacementPhotos.length === 0 && (
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                    {listing.images.map((src, index) => <Image key={src} src={src} alt={`${listing.title} ${index + 1}`} width={112} height={84} className="h-24 w-28 shrink-0 rounded-xl border object-cover" />)}
                  </div>
                )}
                <label className="mt-4 flex min-h-24 cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed p-4 text-sm font-semibold text-slate-600 hover:border-brand-400 hover:bg-brand-50/30">
                  <ImagePlus className="size-5" />
                  {replacementPhotos.length ? `${replacementPhotos.length} ${t('selling.new.step.photos')}` : t('selling.new.choosePhotos')}
                  <input type="file" accept="image/png,image/jpeg,image/webp" multiple className="sr-only" onChange={(event) => setReplacementPhotos(Array.from(event.target.files ?? []).slice(0, 10))} />
                </label>
              </div>

              {saved && <div className="mt-5 flex items-center gap-2 rounded-xl bg-brand-50 p-3 text-sm font-semibold text-brand-800"><CheckCircle2 className="size-4" /> {t('selling.edit.saved')}</div>}
              {mutation.isError && <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{t('common.error')}</p>}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button onClick={save} loading={mutation.isPending} disabled={categoryQuery.isLoading}>{t('selling.edit.save')}</Button>
                <Button variant="outline" asChild><Link href="/selling/listings">{t('common.cancel')}</Link></Button>
              </div>
            </section>
          )}
        </div>
      </main>
    </MarketplaceShell>
  );
}
