'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Mail, MapPin, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AccountSidebar } from '@/components/account/account-sidebar';
import { MarketplaceShell } from '@/components/layout/marketplace-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { accountService } from '@/services/account.service';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name.'),
  email: z.string().email('Enter a valid email address.'),
  phone: z.string().min(10, 'Enter a valid phone number.'),
  state: z.string().min(2, 'State is required.'),
  city: z.string().min(2, 'City is required.'),
  district: z.string().optional(),
  bio: z.string().max(240, 'Bio must be 240 characters or less.').optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

function ProfileSkeleton() {
  return <div className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-11 animate-pulse rounded-xl bg-slate-100" />)}</div>;
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);
  const profileQuery = useQuery({ queryKey: ['account', 'profile'], queryFn: accountService.getProfile });
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    if (!profileQuery.data) return;
    reset({
      fullName: profileQuery.data.fullName,
      email: profileQuery.data.email,
      phone: profileQuery.data.phone,
      state: profileQuery.data.location.state,
      city: profileQuery.data.location.city,
      district: profileQuery.data.location.district ?? '',
      bio: profileQuery.data.bio ?? '',
    });
  }, [profileQuery.data, reset]);

  const mutation = useMutation({
    mutationFn: (values: ProfileForm) => accountService.updateProfile({
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      bio: values.bio,
      location: {
        state: values.state,
        stateCode: profileQuery.data?.location.stateCode ?? 'SP',
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
        state: data.location.state,
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
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">My Profile</h1>
          <p className="mt-1 text-slate-500">Keep your account and contact information up to date.</p>
        </div>

        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <AccountSidebar />
          <div className="space-y-6">
            {profileQuery.isLoading && <ProfileSkeleton />}

            {profileQuery.isError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
                <h2 className="font-bold text-rose-900">We could not load your profile</h2>
                <p className="mt-1 text-sm text-rose-700">Try again. Your changes have not been lost.</p>
                <Button className="mt-4" variant="outline" onClick={() => profileQuery.refetch()}>Try again</Button>
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
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"><ShieldCheck className="size-3.5" /> Account active</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">Member since {profileQuery.data.memberSince}</p>
                        <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
                          <span className="inline-flex items-center gap-1.5"><Mail className="size-3.5" /> Email verified</span>
                          <span className="inline-flex items-center gap-1.5"><Phone className="size-3.5" /> Phone verified</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="p-6 sm:p-7">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="sm:col-span-2">
                        <span className="mb-2 flex items-center gap-2 text-sm font-semibold"><UserRound className="size-4 text-slate-400" /> Full name</span>
                        <Input {...register('fullName')} aria-invalid={!!errors.fullName} />
                        {errors.fullName && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.fullName.message}</p>}
                      </label>

                      <label>
                        <span className="mb-2 block text-sm font-semibold">Email</span>
                        <Input type="email" {...register('email')} aria-invalid={!!errors.email} />
                        {errors.email && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.email.message}</p>}
                      </label>

                      <label>
                        <span className="mb-2 block text-sm font-semibold">Phone</span>
                        <Input {...register('phone')} aria-invalid={!!errors.phone} />
                        {errors.phone && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.phone.message}</p>}
                      </label>

                      <label>
                        <span className="mb-2 flex items-center gap-2 text-sm font-semibold"><MapPin className="size-4 text-slate-400" /> State</span>
                        <Input {...register('state')} aria-invalid={!!errors.state} />
                        {errors.state && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.state.message}</p>}
                      </label>

                      <label>
                        <span className="mb-2 block text-sm font-semibold">City</span>
                        <Input {...register('city')} aria-invalid={!!errors.city} />
                        {errors.city && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.city.message}</p>}
                      </label>

                      <label className="sm:col-span-2">
                        <span className="mb-2 block text-sm font-semibold">District / Neighborhood</span>
                        <Input {...register('district')} placeholder="e.g. Vila Mariana" />
                      </label>

                      <label className="sm:col-span-2">
                        <span className="mb-2 block text-sm font-semibold">About me</span>
                        <textarea {...register('bio')} rows={4} className="w-full resize-none rounded-xl border bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100" placeholder="A short introduction shown on your account profile." />
                        {errors.bio && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.bio.message}</p>}
                      </label>
                    </div>

                    <div className="mt-7 flex flex-wrap items-center gap-3 border-t pt-5">
                      <Button type="submit" disabled={mutation.isPending || !isDirty}>{mutation.isPending ? 'Saving...' : 'Save changes'}</Button>
                      {saved && <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700"><CheckCircle2 className="size-4" /> Profile updated</span>}
                      {mutation.isError && <span className="text-sm font-semibold text-rose-600">Could not save your changes.</span>}
                    </div>
                  </form>
                </section>

                <section className="rounded-2xl border bg-white p-6 shadow-sm">
                  <h2 className="font-bold">Profile privacy</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">Your email and phone number are account details. Marketlift does not show them publicly unless a product flow explicitly allows contact sharing.</p>
                </section>
              </>
            )}
          </div>
        </div>
      </main>
    </MarketplaceShell>
  );
}
