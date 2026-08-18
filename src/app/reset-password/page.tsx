'use client';

import Link from 'next/link';
import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2 } from 'lucide-react';

import { AuthShell } from '@/components/auth/auth-shell';
import { PasswordField } from '@/components/auth/password-field';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/providers/locale-provider';
import { authService } from '@/services/auth.service';

function Reset() {
  const params = useSearchParams();
  const { t } = useLocale();
  const [done, setDone] = useState(false);
  const [requestError, setRequestError] = useState('');

  const schema = useMemo(
    () =>
      z
        .object({
          password: z.string().min(8, t('auth.validation.password8')),
          confirm: z.string().min(8, t('auth.validation.confirm')),
        })
        .refine((data) => data.password === data.confirm, {
          path: ['confirm'],
          message: t('auth.validation.mismatch'),
        }),
    [t],
  );
  type Data = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Data>({ resolver: zodResolver(schema) });

  async function submit(data: Data) {
    const result = await authService.resetPassword({
      token: params.get('token') || '',
      password: data.password,
    });

    if (!result.success) setRequestError(t('auth.reset.invalid'));
    else setDone(true);
  }

  return (
    <AuthShell title={t('auth.reset.title')} subtitle={t('auth.reset.subtitle')}>
      {done ? (
        <div className="text-center" role="status">
          <CheckCircle2 className="mx-auto size-14 text-emerald-600" />
          <h2 className="mt-4 text-2xl font-black">{t('auth.reset.updated')}</h2>
          <p className="mt-2 text-sm text-slate-600">{t('auth.reset.updatedBody')}</p>
          <Button className="mt-6 w-full" asChild>
            <Link href="/login">{t('access.signIn')}</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="new-password" className="mb-2 block text-sm font-bold">{t('auth.reset.newPassword')}</label>
            <PasswordField id="new-password" {...register('password')} autoComplete="new-password" aria-invalid={Boolean(errors.password)} />
            {errors.password && <p className="mt-1.5 text-sm font-medium text-rose-600">{errors.password.message}</p>}
          </div>
          <div>
            <label htmlFor="confirm-new-password" className="mb-2 block text-sm font-bold">{t('auth.reset.confirm')}</label>
            <PasswordField id="confirm-new-password" {...register('confirm')} autoComplete="new-password" aria-invalid={Boolean(errors.confirm)} />
            {errors.confirm && <p className="mt-1.5 text-sm font-medium text-rose-600">{errors.confirm.message}</p>}
          </div>
          {requestError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">{requestError}</p>}
          <Button type="submit" size="lg" className="w-full" loading={isSubmitting} loadingText={t('auth.reset.updating')}>
            {t('auth.reset.update')}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <Reset />
    </Suspense>
  );
}
