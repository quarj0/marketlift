'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, KeyRound } from 'lucide-react';

import { AuthShell } from '@/components/auth/auth-shell';
import { PasswordField } from '@/components/auth/password-field';
import { Button } from '@/components/ui/button';
import { MarketliftApiError } from '@/lib/api-client';
import { useLocale } from '@/providers/locale-provider';
import { authService } from '@/services/auth.service';

export function ResetPasswordClient({ token }: { token: string }) {
  const { t } = useLocale();
  const [completed, setCompleted] = useState(false);
  const [requestError, setRequestError] = useState('');

  const schema = useMemo(
    () =>
      z
        .object({
          password: z.string().min(8, t('auth.validation.password8')),
          confirmPassword: z.string().min(8, t('auth.validation.confirm')),
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
    if (!token) return;
    setRequestError('');
    try {
      await authService.resetPassword({ token, password: data.password });
      setCompleted(true);
    } catch (error) {
      if (error instanceof MarketliftApiError) {
        const message = error.message || '';
        setRequestError(
          /invalid|expired|token/i.test(message) ? t('auth.reset.invalid') : message,
        );
      } else {
        setRequestError(t('auth.reset.failed'));
      }
    }
  }

  return (
    <AuthShell title={t('auth.reset.title')} subtitle={t('auth.reset.subtitle')}>
      {!token ? (
        <div className="text-center" role="alert">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-50 text-amber-700">
            <KeyRound className="size-7" />
          </span>
          <h2 className="mt-4 text-xl font-black text-slate-950">{t('auth.reset.invalidTitle')}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{t('auth.reset.invalid')}</p>
          <Button className="mt-5" asChild>
            <Link href="/forgot-password">{t('auth.reset.requestNew')}</Link>
          </Button>
        </div>
      ) : completed ? (
        <div className="text-center" role="status">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="size-7" />
          </span>
          <h2 className="mt-4 text-xl font-black text-slate-950">{t('auth.reset.updated')}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{t('auth.reset.updatedBody')}</p>
          <Button className="mt-5" asChild>
            <Link href="/login">{t('access.signIn')}</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          {requestError && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
              {requestError}
              {/invalid|expired/i.test(requestError) && (
                <div className="mt-2">
                  <Link href="/forgot-password" className="font-black text-rose-900 underline underline-offset-2">
                    {t('auth.reset.requestNew')}
                  </Link>
                </div>
              )}
            </div>
          )}

          <div>
            <label htmlFor="reset-password" className="mb-1.5 block text-sm font-bold">
              {t('auth.reset.newPassword')}
            </label>
            <PasswordField
              id="reset-password"
              {...register('password')}
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
            />
            {errors.password && (
              <p className="mt-1.5 text-sm font-medium text-rose-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="reset-confirm-password" className="mb-1.5 block text-sm font-bold">
              {t('auth.reset.confirm')}
            </label>
            <PasswordField
              id="reset-confirm-password"
              {...register('confirmPassword')}
              autoComplete="new-password"
              aria-invalid={Boolean(errors.confirmPassword)}
            />
            {errors.confirmPassword && (
              <p className="mt-1.5 text-sm font-medium text-rose-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" size="lg" className="w-full" loading={isSubmitting} loadingText={t('auth.reset.updating')}>
            {t('auth.reset.update')}
          </Button>

          <p className="text-center text-sm text-slate-600">
            <Link href="/login" className="font-bold text-brand-700 hover:underline">
              {t('auth.backSignIn')}
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
