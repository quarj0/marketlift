'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck } from 'lucide-react';

import { AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/providers/locale-provider';
import { authService } from '@/services/auth.service';

export default function ForgotPassword() {
  const { t } = useLocale();
  const [sent, setSent] = useState('');

  const schema = useMemo(
    () => z.object({ identifier: z.string().min(5, t('auth.validation.resetIdentifier')) }),
    [t],
  );
  type Data = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Data>({ resolver: zodResolver(schema) });

  async function submit(data: Data) {
    const result = await authService.requestPasswordReset(data.identifier);
    setSent(result.maskedDestination);
  }

  return (
    <AuthShell title={t('auth.forgot.title')} subtitle={t('auth.forgot.subtitle')}>
      {sent ? (
        <div className="text-center" role="status">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
            <MailCheck className="size-7" />
          </span>
          <h2 className="mt-4 text-xl font-black">{t('auth.forgot.sentTitle')}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {t('auth.forgot.sentBody', { destination: sent })}
          </p>
          <Button className="mt-6 w-full" asChild>
            <Link href="/reset-password?token=demo-reset-token">{t('auth.forgot.demo')}</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="reset-identifier" className="mb-2 block text-sm font-bold">{t('auth.emailPhone')}</label>
            <Input id="reset-identifier" {...register('identifier')} placeholder="you@example.com or +55…" aria-invalid={Boolean(errors.identifier)} />
            {errors.identifier && <p className="mt-1.5 text-sm font-medium text-rose-600">{errors.identifier.message}</p>}
          </div>
          <Button type="submit" size="lg" className="w-full" loading={isSubmitting} loadingText={t('auth.forgot.sending')}>
            {t('auth.forgot.send')}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="font-bold text-brand-700 hover:underline">{t('auth.backSignIn')}</Link>
      </p>
    </AuthShell>
  );
}
