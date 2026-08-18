'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, Plus, Search, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { useLocale } from '@/providers/locale-provider';

export function MobileNav() {
  const pathname = usePathname();
  const { hydrated, isAuthenticated, canSell } = useAuth();
  const { t } = useLocale();

  const hidden =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/verify') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password');

  if (!hydrated || !isAuthenticated || hidden) return null;

  const items = [
    { href: '/', label: t('mobile.home'), icon: Home },
    { href: '/search', label: t('mobile.search'), icon: Search },
    {
      href: canSell ? '/selling/listings/new' : '/selling/start',
      label: t('mobile.sell'),
      icon: Plus,
      primary: true,
    },
    { href: '/messages', label: t('mobile.messages'), icon: MessageCircle },
    { href: '/account/profile', label: t('mobile.profile'), icon: UserRound },
  ];

  return (
    <nav
      aria-label={t('mobile.navigation')}
      className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t bg-white/98 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden"
    >
      {items.map(({ href, label, icon: Icon, primary }) => {
        const active = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex min-h-[68px] min-w-0 flex-col items-center justify-center gap-1 px-1 text-[10px] font-bold transition sm:text-[11px]',
              active ? 'text-brand-700' : 'text-slate-500',
            )}
          >
            {primary ? (
              <span className="-mt-6 grid size-14 place-items-center rounded-full border-4 border-white bg-brand-600 text-white shadow-lg">
                <Icon className="size-6" aria-hidden="true" />
              </span>
            ) : (
              <Icon className={cn('size-5', active && 'stroke-[2.5]')} aria-hidden="true" />
            )}
            <span className="max-w-full truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
