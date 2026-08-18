'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Heart, Home, MessageCircle, Settings, Star, Store, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';

function isActive(pathname: string, href: string) {
  if (href === '/account') return pathname === '/account';
  if (href === '/messages') return pathname.startsWith('/messages');
  if (href === '/selling') return pathname.startsWith('/selling');
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AccountSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { canSell } = useAuth();
  const items = useMemo(() => [
    ['/account', 'Overview', Home],
    ['/account/profile', 'My Profile', User],
    ['/account/saved', 'Saved Listings', Heart],
    ['/messages', 'Messages', MessageCircle],
    ['/account/reviews', 'Reviews', Star],
    ['/account/settings', 'Settings', Settings],
    [canSell ? '/selling' : '/selling/start', canSell ? 'Selling' : 'Start Selling', Store],
  ] as const, [canSell]);
  const current = items.find(([href]) => isActive(pathname, href)) ?? items[0];
  const CurrentIcon = current[2];

  return (
    <>
      <div className="lg:hidden">
        <button type="button" onClick={() => setOpen(true)} className="flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3 text-left shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500" aria-haspopup="dialog" aria-expanded={open}>
          <span className="flex min-w-0 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><CurrentIcon className="size-4" aria-hidden="true" /></span><span className="min-w-0"><span className="block text-[11px] font-black uppercase tracking-[.14em] text-slate-400">Account menu</span><span className="block truncate text-sm font-black">{current[1]}</span></span></span>
          <ChevronDown className="size-5 shrink-0 text-slate-400" aria-hidden="true" />
        </button>
      </div>

      <aside className="hidden rounded-2xl border bg-white p-2 shadow-sm lg:block" aria-label="Account navigation"><nav className="space-y-1">{items.map(([href, label, Icon]) => { const active = isActive(pathname, href); return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={cn('flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition', active ? 'bg-blue-50 text-blue-800 ring-1 ring-blue-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950')}><Icon className="size-4 shrink-0" aria-hidden="true" />{label}</Link>; })}</nav></aside>

      {open && <div className="fixed inset-0 z-[110] lg:hidden" role="dialog" aria-modal="true" aria-label="Account navigation"><button type="button" className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]" onClick={() => setOpen(false)} aria-label="Close account menu" /><div className="absolute inset-x-0 bottom-0 max-h-[82dvh] overflow-y-auto rounded-t-3xl bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 shadow-2xl"><div className="mb-3 flex items-center justify-between px-1"><div><p className="text-xs font-black uppercase tracking-[.14em] text-blue-700">My Marketlift</p><h2 className="mt-1 text-xl font-black">Navigate</h2></div><Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close account menu"><X className="size-5" /></Button></div><nav className="grid grid-cols-2 gap-2" aria-label="Account mobile navigation">{items.map(([href, label, Icon]) => { const active = isActive(pathname, href); return <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active ? 'page' : undefined} className={cn('flex min-h-[76px] flex-col justify-between rounded-2xl border p-3 text-sm font-bold', active ? 'border-blue-200 bg-blue-50 text-blue-900 ring-1 ring-blue-100' : 'bg-white text-slate-700')}><Icon className="size-5" aria-hidden="true" /><span>{label}</span></Link>; })}</nav></div></div>}
    </>
  );
}
