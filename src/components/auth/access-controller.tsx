'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { LockKeyhole, Store } from 'lucide-react';

import { MarketliftLogo } from '@/components/marketplace/logo';
import { LanguageSwitcher } from '@/components/i18n/language-switcher';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import { useLocale } from '@/providers/locale-provider';

function requiresAuthentication(pathname: string) {
  return pathname.startsWith('/account')
    || pathname.startsWith('/messages')
    || pathname.startsWith('/notifications')
    || pathname.startsWith('/selling');
}

function requiresSellingCapability(pathname: string) {
  if (!pathname.startsWith('/selling')) return false;
  return pathname !== '/selling/start' && !pathname.startsWith('/selling/start/');
}

function AccessScreen({ pathname, mode }: { pathname: string; mode: 'auth' | 'selling' }) {
  const { t } = useLocale();
  const selling = mode === 'selling';

  return (
    <main id="main-content" className="min-h-screen bg-slate-50 px-4 py-8 sm:py-14">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-between gap-4">
          <MarketliftLogo size="large" />
          <LanguageSwitcher />
        </div>

        <section
          className="mt-8 rounded-3xl border bg-white p-6 text-center shadow-sm sm:p-9"
          aria-labelledby="access-title"
        >
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
            {selling ? <Store className="size-7" /> : <LockKeyhole className="size-7" />}
          </span>

          <h1 id="access-title" className="mt-5 text-2xl font-black text-slate-950 sm:text-3xl">
            {selling ? t('access.sellTitle') : t('access.signInTitle')}
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
            {selling ? t('access.sellBody') : t('access.signInBody')}
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {selling ? (
              <>
                <Button asChild>
                  <Link href="/selling/start">{t('access.startSelling')}</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/account">{t('access.backAccount')}</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild>
                  <Link href={`/login?returnTo=${encodeURIComponent(pathname)}`}>{t('access.signIn')}</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/register?returnTo=${encodeURIComponent(pathname)}`}>{t('access.createAccount')}</Link>
                </Button>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export function AccessController({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useLocale();
  const { hydrated, isAuthenticated, canSell } = useAuth();
  const [mounted, setMounted] = useState(false);
  const authRequired = requiresAuthentication(pathname);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  if (!authRequired) return <>{children}</>;

  const authReady = mounted && hydrated;

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12" role="status" aria-live="polite">
        <span className="sr-only">{t('access.checking')}</span>
        <div className="mx-auto max-w-lg animate-pulse space-y-4">
          <div className="mx-auto h-16 w-44 rounded-2xl bg-slate-200" />
          <div className="h-72 rounded-3xl bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <AccessScreen mode="auth" pathname={pathname} />;
  if (requiresSellingCapability(pathname) && !canSell) {
    return <AccessScreen mode="selling" pathname={pathname} />;
  }

  return <>{children}</>;
}
