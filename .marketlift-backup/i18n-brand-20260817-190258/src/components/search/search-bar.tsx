'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Location } from '@/types';

export function SearchBar({ compact = false, location }: { compact?: boolean; location?: Location }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [localLocation, setLocalLocation] = useState(location ? `${location.city}, ${location.stateCode}` : 'São Paulo, SP');

  function submit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    const selected = location ? `${location.city}, ${location.stateCode}` : localLocation;
    if (selected) params.set('location', selected);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form onSubmit={submit} className={compact ? 'flex w-full gap-2' : 'grid gap-3 rounded-2xl bg-white p-3 shadow-soft md:grid-cols-[1fr_260px_auto]'}>
      <label className="relative min-w-0 flex-1">
        <Search className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} className="pl-11" placeholder="iPhone 15, apartment, Toyota Corolla..." aria-label="Search listings" />
      </label>
      {!compact && (
        <label className="relative">
          <MapPin className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
          <Input value={localLocation} onChange={(e) => setLocalLocation(e.target.value)} className="pl-11" aria-label="Location" />
        </label>
      )}
      <Button type="submit" size={compact ? 'default' : 'lg'} className="shrink-0"><Search className="size-4" />{compact ? <span className="sr-only">Search</span> : 'Search'}</Button>
    </form>
  );
}
