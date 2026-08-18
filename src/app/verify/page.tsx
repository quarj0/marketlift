'use client';

import Link from 'next/link';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Smartphone } from 'lucide-react';

import { AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/providers/locale-provider';
import { authService } from '@/services/auth.service';

function Verify() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useLocale();
  const channel = params.get('channel') === 'phone' ? 'phone' : 'email';
  const channelLabel = t(`auth.channel.${channel}`);
  const alternateChannel = channel === 'email' ? 'phone' : 'email';
  const alternateChannelLabel = t(`auth.channel.${alternateChannel}`);

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
    try {
      pending = JSON.parse(sessionStorage.getItem('marketlift-pending-user') || '{}');
    } catch {}

    const result = await authService.verifyOtp(digits.join(''), pending);
    setWorking(false);

    if (!result.success) {
      setError(t('auth.verify.invalid'));
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
    <AuthShell
      title={t('auth.verify.title', { channel: channelLabel })}
      subtitle={t('auth.verify.subtitle', { channel: channelLabel })}
    >
      <div className="text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          {channel === 'email' ? <Mail /> : <Smartphone />}
        </span>

        <p className="mt-4 text-sm leading-6 text-slate-600">
          {t('auth.verify.mock')}{' '}
          <strong className="rounded bg-slate-100 px-1.5 py-1 font-black tracking-widest">123456</strong>.
        </p>

        <div className="mt-6 flex justify-center gap-1.5 sm:gap-2" role="group" aria-label={t('auth.verify.codeGroup')}>
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => { refs.current[index] = element; }}
              aria-label={t('auth.verify.digit', { number: index + 1 })}
              value={digit}
              onChange={(event) => change(index, event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Backspace' && !digits[index] && index > 0) {
                  refs.current[index - 1]?.focus();
                }
              }}
              inputMode="numeric"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              className="h-14 w-11 rounded-xl border text-center text-xl font-black outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-100 sm:h-16 sm:w-12"
            />
          ))}
        </div>

        {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</p>}

        <Button
          className="mt-6 w-full"
          size="lg"
          disabled={digits.join('').length !== 6}
          loading={working}
          loadingText={t('auth.verify.verifying')}
          onClick={verify}
        >
          {t('auth.verify.account')}
        </Button>

        <Button
          variant="ghost"
          className="mt-2 w-full"
          disabled={seconds > 0}
          loading={resending}
          loadingText={t('auth.verify.resending')}
          onClick={resend}
        >
          {seconds > 0 ? t('auth.verify.resendIn', { seconds }) : t('auth.verify.resend')}
        </Button>

        <div className="mt-5 border-t pt-5 text-sm text-slate-500">
          {t('auth.verify.prefer')}{' '}
          <Link
            href={`/verify?channel=${alternateChannel}${params.get('returnTo') ? `&returnTo=${encodeURIComponent(params.get('returnTo')!)}` : ''}`}
            className="font-bold text-brand-700 hover:underline"
          >
            {t('auth.verify.by', { channel: alternateChannelLabel })}
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <Verify />
    </Suspense>
  );
}
