'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LockKeyhole, Store } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { MarketliftLogo } from '@/components/marketplace/logo';

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
  const selling = mode === 'selling';

  return (
    <main id="main-content" className="min-h-screen bg-slate-50 px-4 py-8 sm:py-14">
      <div className="mx-auto max-w-lg">
        <div className="flex justify-center"><MarketliftLogo size="large" /></div>
        <section className="mt-8 rounded-3xl border bg-white p-6 text-center shadow-sm sm:p-9" aria-labelledby="access-title">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-700">
            {selling ? <Store className="size-7" /> : <LockKeyhole className="size-7" />}
          </span>
          <h1 id="access-title" className="mt-5 text-2xl font-black text-slate-950 sm:text-3xl">
            {selling ? 'Start selling on Marketlift' : 'Sign in to continue'}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
            {selling
              ? 'You already have the right Marketlift account. Activate selling on this same account to publish and manage listings—no second account or login is required.'
              : 'This area is available to registered Marketlift users. You can keep browsing public listings without signing in.'}
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {selling ? (
              <>
                <Button asChild><Link href="/selling/start">Start selling</Link></Button>
                <Button variant="outline" asChild><Link href="/account">Back to account</Link></Button>
              </>
            ) : (
              <>
                <Button asChild><Link href={`/login?returnTo=${encodeURIComponent(pathname)}`}>Sign in</Link></Button>
                <Button variant="outline" asChild><Link href={`/register?returnTo=${encodeURIComponent(pathname)}`}>Create account</Link></Button>
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
  const { hydrated, isAuthenticated, canSell } = useAuth();
  const authRequired = requiresAuthentication(pathname);

  if (!authRequired) return <>{children}</>;

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12" role="status" aria-live="polite">
        <span className="sr-only">Checking account access</span>
        <div className="mx-auto max-w-lg animate-pulse space-y-4">
          <div className="mx-auto h-16 w-44 rounded-2xl bg-slate-200" />
          <div className="h-72 rounded-3xl bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <AccessScreen mode="auth" pathname={pathname} />;
  if (requiresSellingCapability(pathname) && !canSell) return <AccessScreen mode="selling" pathname={pathname} />;

  return <>{children}</>;
}
