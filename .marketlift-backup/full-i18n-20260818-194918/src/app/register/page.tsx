'use client';

import Link from 'next/link';
import { Suspense } from 'react';
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
  fullName: z.string().min(3, 'Enter your full name'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(10, 'Enter a valid Brazilian phone number'),
  password: z.string().min(8, 'Use at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm your password'),
  terms: z.literal(true, { errorMap: () => ({ message: 'Accept the terms to continue' }) }),
}).refine((data) => data.password === data.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });
type FormData = z.infer<typeof schema>;

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function submit(data: FormData) {
    const result = await authService.register(data);
    sessionStorage.setItem('marketlift-pending-user', JSON.stringify(result));
    const returnTo = params.get('returnTo');
    router.push(`/verify?channel=email${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ''}`);
  }

  return (
    <AuthShell title="Create your account" subtitle="Join Marketlift to save listings, contact sellers and manage your marketplace activity.">
      <div className="mb-5 grid gap-2 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950 sm:grid-cols-2">
        <span className="flex items-center gap-2 font-semibold"><CheckCircle2 className="size-4 text-blue-700" />No CPF for buyers</span>
        <span className="flex items-center gap-2 font-semibold"><CheckCircle2 className="size-4 text-blue-700" />Browse without registering</span>
      </div>
      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <div><label htmlFor="register-name" className="mb-1.5 block text-sm font-bold">Full name</label><Input id="register-name" {...register('fullName')} autoComplete="name" aria-invalid={Boolean(errors.fullName)} />{errors.fullName && <p className="mt-1.5 text-sm font-medium text-rose-600">{errors.fullName.message}</p>}</div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="register-email" className="mb-1.5 block text-sm font-bold">Email</label><Input id="register-email" type="email" {...register('email')} autoComplete="email" aria-invalid={Boolean(errors.email)} />{errors.email && <p className="mt-1.5 text-sm font-medium text-rose-600">{errors.email.message}</p>}</div>
          <div><label htmlFor="register-phone" className="mb-1.5 block text-sm font-bold">Phone</label><Input id="register-phone" {...register('phone')} placeholder="+55 11 99999-9999" autoComplete="tel" inputMode="tel" aria-invalid={Boolean(errors.phone)} />{errors.phone && <p className="mt-1.5 text-sm font-medium text-rose-600">{errors.phone.message}</p>}</div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="register-password" className="mb-1.5 block text-sm font-bold">Password</label><PasswordField id="register-password" {...register('password')} autoComplete="new-password" aria-invalid={Boolean(errors.password)} />{errors.password && <p className="mt-1.5 text-sm font-medium text-rose-600">{errors.password.message}</p>}</div>
          <div><label htmlFor="register-confirm" className="mb-1.5 block text-sm font-bold">Confirm password</label><PasswordField id="register-confirm" {...register('confirmPassword')} autoComplete="new-password" aria-invalid={Boolean(errors.confirmPassword)} />{errors.confirmPassword && <p className="mt-1.5 text-sm font-medium text-rose-600">{errors.confirmPassword.message}</p>}</div>
        </div>
        <label className="flex min-h-12 items-start gap-3 rounded-xl border p-3 text-sm leading-6 text-slate-600"><input type="checkbox" className="mt-1 size-5 shrink-0 accent-blue-600" {...register('terms')} /><span>I accept the <Link href="/terms" className="font-bold text-blue-700 hover:underline">Terms of Use</Link> and <Link href="/privacy" className="font-bold text-blue-700 hover:underline">Privacy Policy</Link>.</span></label>
        {errors.terms && <p className="text-sm font-medium text-rose-600">{errors.terms.message}</p>}
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting} loadingText="Creating account…">Create account<ArrowRight className="size-4" /></Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">Already registered? <Link href={`/login${params.get('returnTo') ? `?returnTo=${encodeURIComponent(params.get('returnTo')!)}` : ''}`} className="font-black text-blue-700 hover:underline">Sign in</Link></p>
    </AuthShell>
  );
}

export default function RegisterPage() { return <Suspense fallback={<div className="min-h-screen bg-slate-50" />}><RegisterForm /></Suspense>; }
