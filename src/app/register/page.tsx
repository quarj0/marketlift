'use client';

import Link from 'next/link';
import { Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

import { AuthShell } from '@/components/auth/auth-shell';
import { PasswordField } from '@/components/auth/password-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/providers/locale-provider';
import { useMarket } from '@/providers/market-provider';
import { authService } from '@/services/auth.service';

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useLocale();
  const { market } = useMarket();
  const phonePlaceholder = ({ GH: '+233 24 123 4567', NG: '+234 801 234 5678', KE: '+254 712 345 678', ZA: '+27 82 123 4567', CI: '+225 01 23 45 67 89', BR: '+55 11 99999-9999' } as Record<string, string>)[market.code] || '+1234567890';

  const schema = useMemo(
    () =>
      z
        .object({
          fullName: z.string().min(3, t('auth.validation.fullName')),
          email: z.string().email(t('auth.validation.email')),
          phone: z.string().min(7, t('auth.validation.phone')),
          password: z.string().min(8, t('auth.validation.password8')),
          confirmPassword: z.string().min(8, t('auth.validation.confirm')),
          terms: z.literal(true, {
            errorMap: () => ({ message: t('auth.validation.terms') }),
          }),
        })
        .refine((data) => data.password === data.confirmPassword, {
          path: ['confirmPassword'],
          message: t('auth.validation.mismatch'),
        }),
    [t],
  );

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function submit(data: FormData) {
    const result = await authService.register({ ...data, countryCode: market.code });
    sessionStorage.setItem('marketlift-pending-user', JSON.stringify(result));
    const returnTo = params.get('returnTo');
    router.push(`/verify?channel=email${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ''}`);
  }

  return (
    <AuthShell title={t('auth.register.title')} subtitle={t('auth.register.subtitle')}>
      <div className="mb-5 grid gap-2 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-950 sm:grid-cols-2">
        <span className="flex items-center gap-2 font-semibold">
          <CheckCircle2 className="size-4 text-brand-700" />
          No identity document required to browse
        </span>
        <span className="flex items-center gap-2 font-semibold">
          <CheckCircle2 className="size-4 text-brand-700" />
          {t('auth.register.browse')}
        </span>
      </div>

      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="register-name" className="mb-1.5 block text-sm font-bold">
            {t('auth.fullName')}
          </label>
          <Input id="register-name" {...register('fullName')} autoComplete="name" aria-invalid={Boolean(errors.fullName)} />
          {errors.fullName && <p className="mt-1.5 text-sm font-medium text-rose-600">{errors.fullName.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="register-email" className="mb-1.5 block text-sm font-bold">{t('auth.email')}</label>
            <Input id="register-email" type="email" {...register('email')} autoComplete="email" aria-invalid={Boolean(errors.email)} />
            {errors.email && <p className="mt-1.5 text-sm font-medium text-rose-600">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="register-phone" className="mb-1.5 block text-sm font-bold">{t('auth.phone')}</label>
            <Input id="register-phone" {...register('phone')} placeholder={phonePlaceholder} autoComplete="tel" inputMode="tel" aria-invalid={Boolean(errors.phone)} />
            {errors.phone && <p className="mt-1.5 text-sm font-medium text-rose-600">{errors.phone.message}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="register-password" className="mb-1.5 block text-sm font-bold">{t('auth.password')}</label>
            <PasswordField id="register-password" {...register('password')} autoComplete="new-password" aria-invalid={Boolean(errors.password)} />
            {errors.password && <p className="mt-1.5 text-sm font-medium text-rose-600">{errors.password.message}</p>}
          </div>
          <div>
            <label htmlFor="register-confirm" className="mb-1.5 block text-sm font-bold">{t('auth.confirmPassword')}</label>
            <PasswordField id="register-confirm" {...register('confirmPassword')} autoComplete="new-password" aria-invalid={Boolean(errors.confirmPassword)} />
            {errors.confirmPassword && <p className="mt-1.5 text-sm font-medium text-rose-600">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <label className="flex min-h-12 items-start gap-3 rounded-xl border p-3 text-sm leading-6 text-slate-600">
          <input type="checkbox" className="mt-1 size-5 shrink-0 accent-brand-600" {...register('terms')} />
          <span>
            {t('auth.register.accept')}{' '}
            <Link href="/terms" className="font-bold text-brand-700 hover:underline">{t('auth.register.terms')}</Link>{' '}
            {t('auth.register.and')}{' '}
            <Link href="/privacy" className="font-bold text-brand-700 hover:underline">{t('auth.register.privacy')}</Link>.
          </span>
        </label>
        {errors.terms && <p className="text-sm font-medium text-rose-600">{errors.terms.message}</p>}

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting} loadingText={t('auth.register.creating')}>
          {t('access.createAccount')}
          <ArrowRight className="size-4" />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        {t('auth.register.already')}{' '}
        <Link
          href={`/login${params.get('returnTo') ? `?returnTo=${encodeURIComponent(params.get('returnTo')!)}` : ''}`}
          className="font-black text-brand-700 hover:underline"
        >
          {t('access.signIn')}
        </Link>
      </p>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <RegisterForm />
    </Suspense>
  );
}
