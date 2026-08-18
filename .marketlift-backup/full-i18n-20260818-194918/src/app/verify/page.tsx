'use client';

import Link from 'next/link';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Smartphone } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth.service';

function Verify() {
  const router = useRouter();
  const params = useSearchParams();
  const channel = params.get('channel') === 'phone' ? 'phone' : 'email';
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [seconds, setSeconds] = useState(30);
  const [working, setWorking] = useState(false);
  const [resending, setResending] = useState(false);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  function change(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    setDigits((current) => current.map((item, itemIndex) => itemIndex === index ? digit : item));
    if (digit && index < 5) refs.current[index + 1]?.focus();
  }

  async function verify() {
    setWorking(true);
    setError('');
    let pending = {};
    try { pending = JSON.parse(sessionStorage.getItem('marketlift-pending-user') || '{}'); } catch {}
    const result = await authService.verifyOtp(digits.join(''), pending);
    setWorking(false);
    if (!result.success) {
      setError('That code is not valid. Use 123456 for the current mocked verification flow.');
      return;
    }
    router.push(params.get('returnTo') || '/account');
    router.refresh();
  }

  async function resend() {
    setResending(true);
    await authService.resendOtp();
    setResending(false);
    setSeconds(30);
  }

  return (
    <AuthShell title={`Verify your ${channel}`} subtitle={`Enter the six-digit code sent to your ${channel}.`}>
      <div className="text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-700">{channel === 'email' ? <Mail /> : <Smartphone />}</span>
        <p className="mt-4 text-sm leading-6 text-slate-600">For this mocked flow, use <strong className="rounded bg-slate-100 px-1.5 py-1 font-black tracking-widest">123456</strong>.</p>
        <div className="mt-6 flex justify-center gap-1.5 sm:gap-2" role="group" aria-label="Six digit verification code">
          {digits.map((digit, index) => (
            <input key={index} ref={(element) => { refs.current[index] = element; }} aria-label={`Digit ${index + 1}`} value={digit} onChange={(event) => change(index, event.target.value)} onKeyDown={(event) => { if (event.key === 'Backspace' && !digits[index] && index > 0) refs.current[index - 1]?.focus(); }} inputMode="numeric" autoComplete={index === 0 ? 'one-time-code' : 'off'} maxLength={1} className="h-14 w-11 rounded-xl border text-center text-xl font-black outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 sm:h-16 sm:w-12" />
          ))}
        </div>
        {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</p>}
        <Button className="mt-6 w-full" size="lg" disabled={digits.join('').length !== 6} loading={working} loadingText="Verifying…" onClick={verify}>Verify account</Button>
        <Button variant="ghost" className="mt-2 w-full" disabled={seconds > 0} loading={resending} loadingText="Resending…" onClick={resend}>{seconds > 0 ? `Resend code in ${seconds}s` : 'Resend code'}</Button>
        <div className="mt-5 border-t pt-5 text-sm text-slate-500">Prefer another method? <Link href={`/verify?channel=${channel === 'email' ? 'phone' : 'email'}${params.get('returnTo') ? `&returnTo=${encodeURIComponent(params.get('returnTo')!)}` : ''}`} className="font-bold text-blue-700 hover:underline">Verify by {channel === 'email' ? 'phone' : 'email'}</Link></div>
      </div>
    </AuthShell>
  );
}

export default function VerifyPage() { return <Suspense fallback={<div className="min-h-screen bg-slate-50" />}><Verify /></Suspense>; }
