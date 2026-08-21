'use client';

import Link from 'next/link';
import { Suspense, useMemo, useState } from 'react';
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
import { authService } from '@/services/auth.service';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useLocale();
  const [error, setError] = useState('');

  const schema = useMemo(
    () =>
      z.object({
        emailOrPhone: z.string().min(5, t('auth.validation.identifier')),
        password: z.string().min(6, t('auth.validation.password6')),
      }),
    [t],
  );

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { emailOrPhone: '', password: '' },
  });

  async function onSubmit(data: FormData) {
    try {
      setError('');
      await authService.login(data);
      router.push(params.get('returnTo') || '/account');
      router.refresh();
    } catch {
      setError(t('auth.login.failed'));
    }
  }

  return (
    <AuthShell title={t('auth.login.title')} subtitle={t('auth.login.subtitle')}>
      <div className="mb-5 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm leading-6 text-brand-950">
        <p className="flex items-center gap-2 font-black">
          <CheckCircle2 className="size-4 text-brand-700" />
          {t('auth.login.noSwitch')}
        </p>
        <p className="mt-1 text-xs text-brand-800">{t('auth.login.noSwitchBody')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <label htmlFor="login-identifier" className="mb-2 block text-sm font-bold">
            {t('auth.emailPhone')}
          </label>
          <Input
            id="login-identifier"
            {...register('emailOrPhone')}
            placeholder="you@example.com or +55…"
            autoComplete="username"
            aria-invalid={Boolean(errors.emailOrPhone)}
            aria-describedby={errors.emailOrPhone ? 'login-identifier-error' : undefined}
          />
          {errors.emailOrPhone && (
            <p id="login-identifier-error" className="mt-1.5 text-sm font-medium text-rose-600">
              {errors.emailOrPhone.message}
            </p>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label htmlFor="login-password" className="text-sm font-bold">
              {t('auth.password')}
            </label>
            <Link href="/forgot-password" className="text-sm font-bold text-brand-700 hover:underline">
              {t('auth.forgot')}
            </Link>
          </div>
          <PasswordField
            id="login-password"
            {...register('password')}
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
          />
          {errors.password && (
            <p className="mt-1.5 text-sm font-medium text-rose-600">{errors.password.message}</p>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">
            {error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={isSubmitting}
          loadingText={t('auth.login.signing')}
        >
          {t('access.signIn')}
          <ArrowRight className="size-4" />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        {t('auth.login.new')}{' '}
        <Link
          href={`/register${params.get('returnTo') ? `?returnTo=${encodeURIComponent(params.get('returnTo')!)}` : ''}`}
          className="font-black text-brand-700 hover:underline"
        >
          {t('access.createAccount')}
        </Link>
      </p>

      <p className="mt-3 text-center text-sm">
        <Link href="/" className="font-bold text-slate-500 hover:text-brand-700 hover:underline">
          {t('auth.login.guest')}
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LoginForm />
    </Suspense>
  );
}
