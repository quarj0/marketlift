'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Heart, LogOut, Menu, MessageCircle, Plus, Store, UserRound, X } from 'lucide-react';
import { MarketliftLogo } from '@/components/marketplace/logo';
import { LocationSelector } from '@/components/marketplace/location-selector';
import { SearchBar } from '@/components/search/search-bar';
import { Button } from '@/components/ui/button';
import { CategoryNav } from '@/components/layout/category-nav';
import { useAuth } from '@/providers/auth-provider';
import type { Location } from '@/types';

export function MarketplaceHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [location, setLocation] = useState<Location>({ state: 'São Paulo', stateCode: 'SP', city: 'São Paulo' });
  const { user, hydrated, isAuthenticated, canSell, logout } = useAuth();
  const privateWorkspace = pathname.startsWith('/selling') || pathname.startsWith('/account') || pathname.startsWith('/messages') || pathname.startsWith('/notifications');
  const sellHref = !isAuthenticated ? '/login?returnTo=%2Fselling%2Fstart' : canSell ? '/selling/listings/new' : '/selling/start';
  const initials = user?.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'U';

  function signOut() {
    logout();
    setAccountOpen(false);
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:px-6 lg:gap-4 lg:px-8">
        <MarketliftLogo size="compact" />
        <div className="hidden min-w-0 flex-1 lg:block"><SearchBar compact location={location} /></div>
        <div className="hidden md:block"><LocationSelector value={location} onChange={setLocation} compact /></div>

        <nav className="ml-auto flex items-center gap-1" aria-label="Account navigation">
          {hydrated && user && (
            <>
              <Button variant="ghost" size="icon" className="hidden xl:inline-flex" asChild><Link href="/account/saved" aria-label="Saved listings"><Heart className="size-5" /></Link></Button>
              <Button variant="ghost" size="icon" className="hidden xl:inline-flex" asChild><Link href="/messages" aria-label="Messages"><MessageCircle className="size-5" /></Link></Button>
              <Button variant="ghost" size="icon" className="hidden xl:inline-flex" asChild><Link href="/notifications" aria-label="Notifications"><Bell className="size-5" /></Link></Button>
            </>
          )}

          {hydrated && !user && (
            <>
              <Button variant="ghost" className="hidden sm:inline-flex" asChild><Link href="/login">Log in</Link></Button>
              <Button variant="outline" className="hidden lg:inline-flex" asChild><Link href="/register">Register</Link></Button>
            </>
          )}

          {hydrated && <Button asChild className="hidden sm:inline-flex"><Link href={sellHref}><Plus className="size-4" />Sell</Link></Button>}

          {hydrated && user && (
            <div className="relative hidden sm:block">
              <button type="button" onClick={() => setAccountOpen((value) => !value)} aria-expanded={accountOpen} aria-haspopup="menu" className="grid size-11 place-items-center rounded-full bg-[#06183a] text-sm font-black text-white shadow-sm ring-offset-2 hover:bg-[#0a2250] focus-visible:ring-2 focus-visible:ring-blue-500">
                <span className="sr-only">Open account menu for {user.name}</span>{initials}
              </button>
              {accountOpen && (
                <>
                  <button type="button" className="fixed inset-0 z-40 cursor-default" aria-label="Close account menu" onClick={() => setAccountOpen(false)} />
                  <div role="menu" className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border bg-white p-2 shadow-xl">
                    <div className="px-3 py-2"><p className="truncate text-sm font-black">{user.name}</p><p className="mt-0.5 text-xs text-slate-500">Marketlift account</p></div>
                    <div className="my-1 border-t" />
                    <Link role="menuitem" href="/account" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-slate-50"><UserRound className="size-4" />My account</Link>
                    <Link role="menuitem" href={canSell ? '/selling' : '/selling/start'} onClick={() => setAccountOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-slate-50"><Store className="size-4" />{canSell ? 'Selling' : 'Start selling'}</Link>
                    <button role="menuitem" type="button" onClick={signOut} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50"><LogOut className="size-4" />Sign out</button>
                  </div>
                </>
              )}
            </div>
          )}

          <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}><Menu className="size-6" /></Button>
        </nav>
      </div>

      {!privateWorkspace && <div className="space-y-2 px-3 pb-3 sm:px-6 lg:hidden"><div className="flex min-w-0 items-center justify-between gap-2 md:hidden"><LocationSelector value={location} onChange={setLocation} compact /><span className="truncate text-xs text-slate-400">Deals near {location.city}</span></div><SearchBar compact location={location} /></div>}
      {!privateWorkspace && <CategoryNav />}

      {menuOpen && (
        <div className="fixed inset-0 z-[90] sm:hidden" role="dialog" aria-modal="true" aria-label="Marketplace menu">
          <button type="button" className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl">
            <div className="flex items-center justify-between"><MarketliftLogo size="compact" /><Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X className="size-5" /></Button></div>
            {user ? <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-3"><span className="grid size-11 place-items-center rounded-full bg-[#06183a] text-sm font-black text-white">{initials}</span><div className="min-w-0 flex-1"><p className="truncate font-black">{user.name}</p><p className="text-xs text-slate-500">Marketlift account</p></div></div> : <div className="mt-5 grid grid-cols-2 gap-2"><Button variant="outline" asChild><Link href="/login" onClick={() => setMenuOpen(false)}>Log in</Link></Button><Button asChild><Link href="/register" onClick={() => setMenuOpen(false)}>Register</Link></Button></div>}
            <div className="mt-4 rounded-2xl bg-slate-50 p-2"><LocationSelector value={location} onChange={setLocation} /></div>
            <nav className="mt-5 grid grid-cols-2 gap-2" aria-label="Mobile menu">
              <Link href="/search" onClick={() => setMenuOpen(false)} className="rounded-2xl border p-4 text-sm font-bold text-slate-700">Browse marketplace</Link>
              {user && <Link href="/account/saved" onClick={() => setMenuOpen(false)} className="rounded-2xl border p-4 text-sm font-bold text-slate-700">Saved listings</Link>}
              {user && <Link href="/messages" onClick={() => setMenuOpen(false)} className="rounded-2xl border p-4 text-sm font-bold text-slate-700">Messages</Link>}
              {user && <Link href="/notifications" onClick={() => setMenuOpen(false)} className="rounded-2xl border p-4 text-sm font-bold text-slate-700">Notifications</Link>}
              {user && <Link href={canSell ? '/selling' : '/selling/start'} onClick={() => setMenuOpen(false)} className="rounded-2xl border p-4 text-sm font-bold text-slate-700">{canSell ? 'Selling' : 'Start selling'}</Link>}
            </nav>
            <Button className="mt-4 w-full" asChild><Link href={sellHref} onClick={() => setMenuOpen(false)}><Plus className="size-4" />Sell</Link></Button>
            {user && <Button variant="ghost" className="mt-2 w-full text-rose-700 hover:bg-rose-50 hover:text-rose-800" onClick={signOut}><LogOut className="size-4" />Sign out</Button>}
          </div>
        </div>
      )}
    </header>
  );
}
