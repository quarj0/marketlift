'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GripVertical,
  ImagePlus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { MarketplaceShell } from '@/components/layout/marketplace-shell';
import { SellingSidebar } from '@/components/selling/selling-sidebar';
import {
  CategoryFields,
  toListingSpecifications,
  validateCategoryAttributes,
  type CategoryFieldErrors,
} from '@/components/selling/category-fields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LocationFields } from '@/components/location/location-fields';
import { categoryService } from '@/services/category.service';
import { sellingService } from '@/services/selling.service';
import type { ListingAttributes } from '@/types';
import { useLocale } from '@/providers/locale-provider';
import { useMarket } from '@/providers/market-provider';

type Form = {
  category: string;
  title: string;
  description: string;
  price: number;
  condition: 'New' | 'Like new' | 'Used';
  negotiable: boolean;
  state: string;
  stateName: string;
  city: string;
  district: string;
  latitude?: number;
  longitude?: number;
};
type PhotoPreview = { name: string; url: string; file: File };

const defaultValues: Form = {
  category: '',
  title: '',
  description: '',
  price: 0,
  condition: 'Used',
  negotiable: false,
  state: '',
  stateName: '',
  city: '',
  district: '',
};

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold">{label}</span>
      {children}
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  );
}

export default function NewListingPage() {
  'use no memo';

  const { t, tr, categoryName: localizedCategoryName } = useLocale();
  const { market, formatMoney } = useMarket();
  const steps = [t('selling.new.step.category'), t('selling.new.step.basic'), t('selling.new.step.photos'), t('selling.new.step.location'), t('selling.new.step.details'), t('selling.new.step.review')];
  const schema = useMemo(() => z.object({
    category: z.string().min(1, t('selling.new.validation.category')),
    title: z.string().min(8, t('selling.new.validation.title')).max(90),
    description: z.string().min(30, t('selling.new.validation.description')),
    price: z.coerce.number().min(0, t('selling.new.validation.price')),
    condition: z.enum(['New', 'Like new', 'Used']),
    negotiable: z.boolean(),
    state: z.string().min(1),
    stateName: z.string().optional(),
    city: z.string().min(1),
    district: z.string().min(2, t('selling.new.validation.district')),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }), [t]);

  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: categoryService.getCategories, staleTime: 5 * 60_000 });
  const categories = categoriesQuery.data ?? [];

  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [cover, setCover] = useState(0);
  const [done, setDone] = useState(false);
  const [attributes, setAttributes] = useState<ListingAttributes>({});
  const [attributeErrors, setAttributeErrors] = useState<CategoryFieldErrors>({});

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const values = useWatch({ control: form.control });
  const selectedCategory = categories.find((category) => category.id === values.category);
  const categoryName = selectedCategory ? localizedCategoryName(selectedCategory.id, selectedCategory.name) : t('selling.new.step.details');

  const categoryQuery = useQuery({
    queryKey: ['category-configuration', values.category],
    queryFn: () => categoryService.getConfiguration(values.category ?? ''),
    enabled: Boolean(values.category),
    staleTime: 5 * 60_000,
  });

  const categoryConfig = categoryQuery.data ?? null;

  const mutation = useMutation({
    mutationFn: sellingService.createListing,
    onSuccess: () => setDone(true),
  });

  const chooseCategory = (categoryId: string) => {
    form.setValue('category', categoryId, { shouldValidate: true });
    setAttributes({});
    setAttributeErrors({});
  };

  const updateAttribute = (fieldId: string, value: string | number | boolean) => {
    setAttributes((current) => ({ ...current, [fieldId]: value }));
    setAttributeErrors((current) => {
      if (!current[fieldId]) return current;
      const nextErrors = { ...current };
      delete nextErrors[fieldId];
      return nextErrors;
    });
  };

  const next = async () => {
    let fields: (keyof Form)[] = [];
    if (step === 0) fields = ['category'];
    if (step === 1) {
      fields = ['title', 'description'];
      if (categoryConfig?.pricing.mode === 'required') fields.push('price');
      if (categoryConfig?.condition.enabled) fields.push('condition');
    }
    if (step === 3) fields = ['state', 'city', 'district'];

    const valid = fields.length ? await form.trigger(fields) : true;
    if (!valid) return;

    if (step === 1 && categoryConfig?.pricing.mode === 'required' && Number(values.price ?? 0) <= 0) {
      form.setError('price', { type: 'manual', message: t('selling.new.validation.pricePositive') });
      return;
    }

    if (step === 4) {
      if (!categoryConfig) return;
      const errors = validateCategoryAttributes(categoryConfig, attributes, t, tr);
      setAttributeErrors(errors);
      if (Object.keys(errors).length) return;
    }

    setStep((current) => Math.min(5, current + 1));
  };

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const remaining = Math.max(0, 10 - photos.length);
    const items = Array.from(files)
      .slice(0, remaining)
      .map((file) => ({ name: file.name, url: URL.createObjectURL(file), file }));
    setPhotos((current) => [...current, ...items]);
  };

  const removePhoto = (index: number) => {
    setPhotos((current) => {
      const target = current[index];
      if (target?.url.startsWith('blob:')) URL.revokeObjectURL(target.url);
      return current.filter((_, photoIndex) => photoIndex !== index);
    });
    setCover((current) => {
      if (index < current) return current - 1;
      if (index === current) return 0;
      return current;
    });
  };

  const resetWizard = () => {
    photos.forEach((photo) => {
      if (photo.url.startsWith('blob:')) URL.revokeObjectURL(photo.url);
    });
    setPhotos([]);
    setCover(0);
    setStep(0);
    setDone(false);
    setAttributes({});
    setAttributeErrors({});
    form.reset(defaultValues);
  };

  const submit = form.handleSubmit((data) => {
    if (!categoryConfig) {
      setStep(4);
      return;
    }

    const errors = validateCategoryAttributes(categoryConfig, attributes, t, tr);
    if (Object.keys(errors).length) {
      setAttributeErrors(errors);
      setStep(4);
      return;
    }

    mutation.mutate({
      title: data.title,
      description: data.description,
      price: data.price,
      category: data.category,
      condition: categoryConfig.condition.enabled ? data.condition : undefined,
      negotiable: data.negotiable,
      images: photos.map((photo) => photo.file),
      location: {
        countryCode: market.code,
        state: data.stateName || data.state,
        stateCode: data.state,
        city: data.city,
        district: data.district,
        latitude: data.latitude,
        longitude: data.longitude,
      },
      attributes,
      categorySchemaVersion: categoryConfig.schemaVersion,
      specifications: toListingSpecifications(categoryConfig, attributes),
    });
  });

  if (done) {
    return (
      <MarketplaceShell>
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="rounded-3xl border bg-white p-8 shadow-sm sm:p-10">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-brand-50 text-brand-700">
              <Check className="size-7" />
            </div>
            <h1 className="mt-5 text-3xl font-black">{t('selling.new.published')}</h1>
            <p className="mt-2 text-slate-500">
              {t('selling.new.publishedBody')}
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild><Link href="/selling/listings">{t('selling.new.myListings')}</Link></Button>
              <Button variant="outline" onClick={resetWizard}>{t('selling.new.postAnother')}</Button>
            </div>
          </div>
        </main>
      </MarketplaceShell>
    );
  }

  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
        <div className="mb-5 sm:mb-7">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-700">{t('selling.new.title')}</p>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{t('selling.new.heading')}</h1>
          <p className="mt-1 text-slate-500">{t('selling.new.body')}</p>
        </div>

        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <SellingSidebar />
          <div className="min-w-0">
            <div className="mb-5 flex gap-2 overflow-x-auto pb-2" aria-label={t('selling.new.progress')}>
              {steps.map((label, index) => (
                <div
                  key={label}
                  aria-current={index === step ? 'step' : undefined}
                  className={`flex min-w-fit items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${
                    index === step
                      ? 'bg-brand-600 text-white'
                      : index < step
                        ? 'bg-brand-50 text-brand-700'
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {index < step ? <Check className="size-3.5" /> : <span>{index + 1}</span>}
                  {label}
                </div>
              ))}
            </div>

            <form onSubmit={submit} className="rounded-3xl border bg-white p-5 shadow-sm sm:p-8">
              {step === 0 && (
                <section>
                  <h2 className="text-xl font-black">{t('selling.new.chooseCategory')}</h2>
                  <p className="mt-1 text-sm text-slate-500">{t('selling.new.chooseCategoryBody')}</p>
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {categories.map((category) => (
                      <button
                        type="button"
                        key={category.id}
                        aria-pressed={values.category === category.id}
                        onClick={() => chooseCategory(category.id)}
                        className={`min-h-24 rounded-2xl border p-4 text-left font-semibold transition ${
                          values.category === category.id
                            ? 'border-brand-500 bg-brand-50 text-brand-800'
                            : 'hover:border-brand-300 hover:bg-slate-50'
                        }`}
                      >
                        {localizedCategoryName(category.id, category.name)}
                      </button>
                    ))}
                  </div>
                  {form.formState.errors.category && (
                    <p className="mt-3 text-sm text-red-600">{form.formState.errors.category.message}</p>
                  )}
                </section>
              )}

              {step === 1 && (
                <section>
                  <h2 className="text-xl font-black">{t('selling.new.basic')}</h2>
                  <div className="mt-5 space-y-4">
                    <Field label={t('selling.new.titleLabel')} error={form.formState.errors.title?.message}>
                      <Input {...form.register('title')} placeholder={t('selling.new.titlePlaceholder')} />
                    </Field>
                    <Field label={t('selling.new.descriptionLabel')} error={form.formState.errors.description?.message}>
                      <textarea
                        {...form.register('description')}
                        className="min-h-40 w-full rounded-xl border bg-white p-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                        placeholder={t('selling.new.descriptionPlaceholder')}
                      />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label={`${(categoryConfig ? tr(categoryConfig.pricing.label) : t('selling.new.priceLabel')).replace(/\s*\(R\$\)/gi, '')} (${market.currencySymbol})`} error={form.formState.errors.price?.message}>
                        <Input
                          type="number"
                          min="0"
                          {...form.register('price')}
                          placeholder={categoryConfig?.pricing.placeholder ? tr(categoryConfig.pricing.placeholder) : undefined}
                        />
                        {categoryConfig?.pricing.mode === 'optional' && (
                          <span className="mt-1 block text-xs text-slate-500">{t('selling.new.optional')}</span>
                        )}
                      </Field>
                      {categoryConfig?.condition.enabled && (
                        <Field label={t('selling.new.condition')}>
                          <select {...form.register('condition')} className="h-11 w-full rounded-xl border bg-white px-3 text-sm">
                            <option value="Used">{t('search.condition.used')}</option>
                            <option value="Like new">{t('search.condition.likeNew')}</option>
                            <option value="New">{t('search.condition.new')}</option>
                          </select>
                        </Field>
                      )}
                    </div>
                    <label className="flex items-center gap-3 rounded-xl border p-4">
                      <input type="checkbox" {...form.register('negotiable')} className="size-5 accent-brand-600" />
                      <span>
                        <b className="block text-sm">{t('selling.new.priceNegotiable')}</b>
                        <span className="text-xs text-slate-500">{t('selling.new.priceNegotiableBody')}</span>
                      </span>
                    </label>
                  </div>
                </section>
              )}

              {step === 2 && (
                <section>
                  <h2 className="text-xl font-black">{t('selling.new.step.photos')}</h2>
                  <p className="mt-1 text-sm text-slate-500">{t('selling.new.photosBody')}</p>
                  <label className="mt-5 grid min-h-44 cursor-pointer place-items-center rounded-2xl border-2 border-dashed p-6 text-center transition hover:border-brand-400 hover:bg-brand-50/40">
                    <input type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={(event) => addPhotos(event.target.files)} />
                    <div>
                      <ImagePlus className="mx-auto size-9 text-slate-400" />
                      <p className="mt-2 font-bold">{t('selling.new.choosePhotos')}</p>
                      <p className="text-xs text-slate-500">{t('selling.new.photoTypes')}</p>
                    </div>
                  </label>
                  {photos.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {photos.map((photo, index) => (
                        <div key={photo.url} className={`relative aspect-square overflow-hidden rounded-xl border ${cover === index ? 'ring-2 ring-brand-500' : ''}`}>
                          <Image src={photo.url} alt={t('selling.new.photoPreview', { name: photo.name })} fill unoptimized className="object-cover" />
                          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 p-2 text-white">
                            <button type="button" className="min-h-11 px-2 text-xs font-bold" onClick={() => setCover(index)}>{cover === index ? t('selling.new.cover') : t('selling.new.setCover')}</button>
                            <button type="button" className="grid size-11 place-items-center rounded-lg hover:bg-white/15" onClick={() => removePhoto(index)} aria-label={t('selling.new.removePhoto', { name: photo.name })}><Trash2 className="size-4" /></button>
                          </div>
                          <GripVertical className="absolute left-2 top-2 size-4 text-white drop-shadow" />
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {step === 3 && (
                <section>
                  <h2 className="text-xl font-black">{t('selling.new.step.location')}</h2>
                  <p className="mt-1 text-sm text-slate-500">{t('selling.new.locationBody')}</p>
                  <div className="mt-5">
                    <LocationFields
                      value={{
                        countryCode: market.code,
                        state: values.stateName ?? '',
                        stateCode: values.state ?? '',
                        city: values.city ?? '',
                        district: values.district ?? '',
                        latitude: values.latitude,
                        longitude: values.longitude,
                      }}
                      onChange={(location) => {
                        form.setValue('state', location.stateCode, { shouldDirty: true, shouldValidate: true });
                        form.setValue('stateName', location.state || location.stateCode, { shouldDirty: true });
                        form.setValue('city', location.city, { shouldDirty: true, shouldValidate: true });
                        form.setValue('district', location.district, { shouldDirty: true, shouldValidate: true });
                        form.setValue('latitude', location.latitude, { shouldDirty: true });
                        form.setValue('longitude', location.longitude, { shouldDirty: true });
                      }}
                      labels={{
                        region: t('search.region'),
                        state: t('selling.new.state'),
                        city: t('selling.new.city'),
                        district: t('selling.new.district'),
                      }}
                      placeholders={{
                        city: t('selling.new.city'),
                        district: t('selling.new.districtPlaceholder'),
                      }}
                      errors={{
                        stateCode: form.formState.errors.state?.message,
                        city: form.formState.errors.city?.message,
                        district: form.formState.errors.district?.message,
                      }}
                      countryCode={market.code}
                      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                    />
                  </div>
                </section>
              )}

              {step === 4 && (
                <section>
                  <h2 className="text-xl font-black">{t('selling.new.detailsTitle', { category: categoryName })}</h2>
                  {categoryQuery.isLoading ? (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2" aria-label={t('selling.new.loadingFields')}>
                      {[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}
                    </div>
                  ) : categoryQuery.isError || !categoryConfig ? (
                    <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5">
                      <p className="font-bold text-red-900">{t('selling.new.categoryError')}</p>
                      <p className="mt-1 text-sm text-red-700">{t('selling.new.categoryErrorBody')}</p>
                      <Button type="button" variant="outline" className="mt-4" onClick={() => categoryQuery.refetch()}>
                        <RefreshCw className="size-4" /> {t('common.retry')}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="mt-1 text-sm text-slate-500">{tr(categoryConfig.description)}</p>
                      <p className="mt-3 text-xs font-semibold text-slate-400">{t('selling.new.required')}</p>
                      <div className="mt-5">
                        <CategoryFields config={categoryConfig} values={attributes} errors={attributeErrors} onChange={updateAttribute} />
                      </div>
                    </>
                  )}
                </section>
              )}

              {step === 5 && (
                <section>
                  <h2 className="text-xl font-black">{t('selling.new.reviewTitle')}</h2>
                  <div className="mt-5 overflow-hidden rounded-2xl border">
                    <div className="grid md:grid-cols-[280px_1fr]">
                      <div className="relative min-h-60 bg-slate-100">
                        {photos[cover] ? (
                          <Image src={photos[cover].url} alt={t('selling.new.coverPreview')} fill unoptimized className="object-cover" />
                        ) : (
                          <div className="grid min-h-60 place-items-center text-sm text-slate-400">{t('selling.new.noPhoto')}</div>
                        )}
                      </div>
                      <div className="p-6">
                        <span className="text-xs font-bold uppercase tracking-wide text-brand-700">{categoryName}</span>
                        <h3 className="mt-2 text-2xl font-black">{values.title || t('selling.new.untitled')}</h3>
                        <p className="mt-2 text-2xl font-black text-brand-700">{formatMoney(Number(values.price || 0))}</p>
                        <p className="mt-3 text-sm text-slate-500">
                          {values.city}, {values.state}
                          {categoryConfig?.condition.enabled ? ` · ${tr(String(values.condition))}` : ''}
                          {values.negotiable ? ` · ${t('listing.negotiable')}` : ''}
                        </p>
                        <p className="mt-5 line-clamp-4 text-sm leading-6 text-slate-600">{values.description || t('selling.new.noDescription')}</p>
                      </div>
                    </div>
                  </div>

                  {categoryConfig && Object.keys(attributes).length > 0 && (
                    <div className="mt-5 rounded-2xl border p-5">
                      <h3 className="font-black">{t('selling.new.detailsTitle', { category: categoryName })}</h3>
                      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                        {Object.entries(toListingSpecifications(categoryConfig, attributes)).map(([label, value]) => (
                          <div key={label} className="rounded-xl bg-slate-50 p-3">
                            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">{tr(label)}</dt>
                            <dd className="mt-1 text-sm font-semibold">{tr(String(value))}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}

                  <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                    {t('selling.new.notice')}
                  </div>

                  {mutation.isError && (
                    <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{t('selling.new.publishError')}</p>
                  )}

                  <Button type="submit" className="mt-5 w-full" size="lg" loading={mutation.isPending} loadingText={t('selling.new.publishing')}>{t('selling.new.publish')}</Button>
                </section>
              )}

              <div className="mt-8 flex items-center justify-between gap-3 border-t pt-5">
                <Button type="button" variant="outline" disabled={step === 0 || mutation.isPending} onClick={() => setStep((current) => Math.max(0, current - 1))}>
                  <ArrowLeft className="size-4" /> {t('common.back')}
                </Button>
                {step < 5 && (
                  <Button type="button" disabled={mutation.isPending || (step === 4 && categoryQuery.isLoading)} onClick={next}>
                    {t('common.continue')} <ArrowRight className="size-4" />
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </MarketplaceShell>
  );
}
