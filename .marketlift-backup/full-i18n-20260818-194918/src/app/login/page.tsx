'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';
import { PasswordField } from '@/components/auth/password-field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth.service';

const schema = z.object({
  emailOrPhone: z.string().min(5, 'Enter your email or phone'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormData = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { emailOrPhone: 'marketlift@demo.marketlift', password: 'marketlift' },
  });

  async function onSubmit(data: FormData) {
    try {
      setError('');
      await authService.login(data);
      router.push(params.get('returnTo') || '/account');
      router.refresh();
    } catch {
      setError('Unable to sign in. Please check your details and try again.');
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="One Marketlift account for buying, selling, messaging and managing your marketplace activity.">
      <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
        <p className="flex items-center gap-2 font-black"><CheckCircle2 className="size-4 text-blue-700" />No buyer or seller account switch</p>
        <p className="mt-1 text-xs text-blue-800">Any registered user can start selling from the same account whenever they are ready.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <label htmlFor="login-identifier" className="mb-2 block text-sm font-bold">Email or phone</label>
          <Input id="login-identifier" {...register('emailOrPhone')} placeholder="you@example.com or +55…" autoComplete="username" aria-invalid={Boolean(errors.emailOrPhone)} aria-describedby={errors.emailOrPhone ? 'login-identifier-error' : undefined} />
          {errors.emailOrPhone && <p id="login-identifier-error" className="mt-1.5 text-sm font-medium text-rose-600">{errors.emailOrPhone.message}</p>}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3"><label htmlFor="login-password" className="text-sm font-bold">Password</label><Link href="/forgot-password" className="text-sm font-bold text-blue-700 hover:underline">Forgot password?</Link></div>
          <PasswordField id="login-password" {...register('password')} autoComplete="current-password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'login-password-error' : undefined} />
          {errors.password && <p id="login-password-error" className="mt-1.5 text-sm font-medium text-rose-600">{errors.password.message}</p>}
        </div>

        {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700" role="alert">{error}</p>}
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting} loadingText="Signing in…">Sign in<ArrowRight className="size-4" /></Button>
      </form>

      <div className="mt-5 rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
        <strong>Demo:</strong> the prefilled account already has selling enabled. To preview a registered user who has not started selling yet, sign in with <code className="rounded bg-white px-1.5 py-0.5">new@demo.marketlift</code>.
      </div>
      <p className="mt-6 text-center text-sm text-slate-600">New to Marketlift? <Link href={`/register${params.get('returnTo') ? `?returnTo=${encodeURIComponent(params.get('returnTo')!)}` : ''}`} className="font-black text-blue-700 hover:underline">Create account</Link></p>
      <p className="mt-3 text-center"><Link href="/" className="text-sm font-semibold text-slate-500 hover:text-blue-700 hover:underline">Continue browsing as a guest</Link></p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div className="min-h-screen bg-slate-50" />}><LoginForm /></Suspense>;
}
