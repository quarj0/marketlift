'use client';

import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Mail, MapPin, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { AccountSidebar } from '@/components/account/account-sidebar';
import { LocalizedDate } from '@/components/i18n/t';
import { LocationFields } from '@/components/location/location-fields';
import { MarketplaceShell } from '@/components/layout/marketplace-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/providers/locale-provider';
import { useMarket } from '@/providers/market-provider';
import { accountService } from '@/services/account.service';

function ProfileSkeleton() {
  return (
    <div className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-11 animate-pulse rounded-xl bg-slate-100" />
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const { t } = useLocale();
  const { market } = useMarket();
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const profileSchema = useMemo(
    () =>
      z.object({
        fullName: z.string().min(2, t('account.profile.validation.name')),
        email: z.string().email(t('account.profile.validation.email')),
        phone: z.string().min(7, t('account.profile.validation.phone')),
        state: z.string().optional(),
        stateCode: z.string().min(2, t('account.profile.validation.state')),
        city: z.string().min(2, t('account.profile.validation.city')),
        district: z.string().optional(),
        bio: z.string().max(240, t('account.profile.validation.bio')).optional(),
      }),
    [t],
  );

  type ProfileForm = z.infer<typeof profileSchema>;

  const profileQuery = useQuery({
    queryKey: ['account', 'profile'],
    queryFn: accountService.getProfile,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    control,
    setValue,
  } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });

  const [state = '', stateCode = '', city = '', district = ''] = useWatch({
    control,
    name: ['state', 'stateCode', 'city', 'district'],
  });

  useEffect(() => {
    if (!profileQuery.data) return;

    reset({
      fullName: profileQuery.data.fullName,
      email: profileQuery.data.email,
      phone: profileQuery.data.phone,
      state: profileQuery.data.location.state || profileQuery.data.location.stateCode || '',
      stateCode: profileQuery.data.location.stateCode,
      city: profileQuery.data.location.city,
      district: profileQuery.data.location.district ?? '',
      bio: profileQuery.data.bio ?? '',
    });
  }, [profileQuery.data, reset]);

  const mutation = useMutation({
    mutationFn: (values: ProfileForm) =>
      accountService.updateProfile({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        bio: values.bio,
        location: {
          countryCode: profileQuery.data?.location.countryCode || market.code,
          state: values.state || profileQuery.data?.location.state || values.stateCode,
          stateCode: values.stateCode,
          city: values.city,
          district: values.district,
        },
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['account', 'profile'], data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      reset({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        state: data.location.state || data.location.stateCode || '',
        stateCode: data.location.stateCode,
        city: data.location.city,
        district: data.location.district ?? '',
        bio: data.bio ?? '',
      });
    },
  });

  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
        <div className="mb-5 sm:mb-7">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{t('account.profile.title')}</h1>
          <p className="mt-1 text-slate-500">{t('account.profile.body')}</p>
        </div>

        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <AccountSidebar />
          <div className="space-y-6">
            {profileQuery.isLoading && <ProfileSkeleton />}

            {profileQuery.isError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
                <h2 className="font-bold text-rose-900">{t('account.profile.loadError')}</h2>
                <p className="mt-1 text-sm text-rose-700">{t('account.profile.loadErrorBody')}</p>
                <Button className="mt-4" variant="outline" onClick={() => profileQuery.refetch()}>
                  {t('common.tryAgain')}
                </Button>
              </div>
            )}

            {profileQuery.data && (
              <>
                <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                  <div className="border-b bg-gradient-to-r from-brand-50 to-white p-6 sm:p-7">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-brand-100 text-2xl font-black text-brand-700">
                        {profileQuery.data.fullName.split(' ').map((part) => part[0]).slice(0, 2).join('')}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-extrabold">{profileQuery.data.fullName}</h2>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                            <ShieldCheck className="size-3.5" />
                            {t('account.profile.active')}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {t('account.profile.memberSince', { date: '' })}<LocalizedDate value={profileQuery.data.memberSince} dateStyle="medium" />
                        </p>

                        <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
                          <span className="inline-flex items-center gap-1.5">
                            <Mail className="size-3.5" /> {t('account.profile.emailVerified')}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Phone className="size-3.5" /> {t('account.profile.phoneVerified')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="p-6 sm:p-7">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="sm:col-span-2">
                        <span className="mb-2 flex items-center gap-2 text-sm font-semibold">
                          <UserRound className="size-4 text-slate-400" /> {t('account.profile.fullName')}
                        </span>
                        <Input {...register('fullName')} aria-invalid={!!errors.fullName} />
                        {errors.fullName && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.fullName.message}</p>}
                      </label>

                      <label>
                        <span className="mb-2 block text-sm font-semibold">{t('account.profile.email')}</span>
                        <Input type="email" {...register('email')} aria-invalid={!!errors.email} />
                        {errors.email && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.email.message}</p>}
                      </label>

                      <label>
                        <span className="mb-2 block text-sm font-semibold">{t('account.profile.phone')}</span>
                        <Input {...register('phone')} aria-invalid={!!errors.phone} />
                        {errors.phone && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.phone.message}</p>}
                      </label>

                      <div className="sm:col-span-2">
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <MapPin className="size-4 text-slate-400" /> {t('account.profile.location')}
                        </div>
                        <LocationFields
                          value={{
                            countryCode: profileQuery.data.location.countryCode || market.code,
                            state: state || profileQuery.data.location.state,
                            stateCode: stateCode || profileQuery.data.location.stateCode || '',
                            city,
                            district,
                          }}
                          onChange={(location) => {
                            setValue('state', location.state || location.stateCode, { shouldDirty: true });
                            setValue('stateCode', location.stateCode, { shouldDirty: true, shouldValidate: true });
                            setValue('city', location.city, { shouldDirty: true, shouldValidate: true });
                            setValue('district', location.district, { shouldDirty: true, shouldValidate: true });
                          }}
                          labels={{
                            region: t('search.region'),
                            state: t('account.profile.state'),
                            city: t('account.profile.city'),
                            district: t('account.profile.district'),
                          }}
                          placeholders={{
                            city: t('account.profile.city'),
                            district: t('account.profile.districtPlaceholder'),
                          }}
                          countryCode={profileQuery.data.location.countryCode || market.code}
                          errors={{
                            stateCode: errors.stateCode?.message,
                            city: errors.city?.message,
                            district: errors.district?.message,
                          }}
                        />
                      </div>

                      <label className="sm:col-span-2">
                        <span className="mb-2 block text-sm font-semibold">{t('account.profile.about')}</span>
                        <textarea
                          {...register('bio')}
                          rows={4}
                          className="w-full resize-none rounded-xl border bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                          placeholder={t('account.profile.bioPlaceholder')}
                        />
                        {errors.bio && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.bio.message}</p>}
                      </label>
                    </div>

                    <div className="mt-7 flex flex-wrap items-center gap-3 border-t pt-5">
                      <Button type="submit" disabled={mutation.isPending || !isDirty}>
                        {mutation.isPending ? t('common.saving') : t('account.profile.save')}
                      </Button>
                      {saved && (
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                          <CheckCircle2 className="size-4" /> {t('account.profile.updated')}
                        </span>
                      )}
                      {mutation.isError && (
                        <span className="text-sm font-semibold text-rose-600">{t('account.profile.saveError')}</span>
                      )}
                    </div>
                  </form>
                </section>

                <section className="rounded-2xl border bg-white p-6 shadow-sm">
                  <h2 className="font-bold">{t('account.profile.privacy')}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{t('account.profile.privacyBody')}</p>
                </section>
              </>
            )}
          </div>
        </div>
      </main>
    </MarketplaceShell>
  );
}
