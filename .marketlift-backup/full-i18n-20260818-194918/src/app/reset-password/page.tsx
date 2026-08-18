'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2 } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';
import { PasswordField } from '@/components/auth/password-field';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth.service';

const schema = z.object({ password: z.string().min(8, 'Use at least 8 characters'), confirm: z.string().min(8, 'Confirm your password') }).refine((data) => data.password === data.confirm, { path: ['confirm'], message: 'Passwords do not match' });
type Data = z.infer<typeof schema>;

function Reset() {
  const params = useSearchParams();
  const [done, setDone] = useState(false);
  const [requestError, setRequestError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Data>({ resolver: zodResolver(schema) });

  async function submit(data: Data) {
    const result = await authService.resetPassword({ token: params.get('token') || '', password: data.password });
    if (!result.success) setRequestError('This reset link is invalid or expired. Request a new one.');
    else setDone(true);
  }

  return (
    <AuthShell title="Choose a new password" subtitle="Use a strong password you don’t use on other services.">
      {done ? (
        <div className="text-center" role="status"><CheckCircle2 className="mx-auto size-14 text-emerald-600" /><h2 className="mt-4 text-2xl font-black">Password updated</h2><p className="mt-2 text-sm text-slate-600">You can now sign in with your new password.</p><Button className="mt-6 w-full" asChild><Link href="/login">Sign in</Link></Button></div>
      ) : (
        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          <div><label htmlFor="new-password" className="mb-2 block text-sm font-bold">New password</label><PasswordField id="new-password" {...register('password')} autoComplete="new-password" aria-invalid={Boolean(errors.password)} />{errors.password && <p className="mt-1.5 text-sm font-medium text-rose-600">{errors.password.message}</p>}</div>
          <div><label htmlFor="confirm-new-password" className="mb-2 block text-sm font-bold">Confirm password</label><PasswordField id="confirm-new-password" {...register('confirm')} autoComplete="new-password" aria-invalid={Boolean(errors.confirm)} />{errors.confirm && <p className="mt-1.5 text-sm font-medium text-rose-600">{errors.confirm.message}</p>}</div>
          {requestError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">{requestError}</p>}
          <Button type="submit" size="lg" className="w-full" loading={isSubmitting} loadingText="Updating…">Update password</Button>
        </form>
      )}
    </AuthShell>
  );
}

export default function ResetPasswordPage() { return <Suspense fallback={<div className="min-h-screen bg-slate-50" />}><Reset /></Suspense>; }
