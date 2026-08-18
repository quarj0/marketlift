'use client';

import Link from 'next/link';
import { ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AuthRequiredDialog({ open, onClose, action = 'continue' }: { open: boolean; onClose: () => void; action?: string }) {
  if (!open) return null;
  const returnTo = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '';

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="auth-required-title">
      <button type="button" className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]" onClick={onClose} aria-label="Close sign-in prompt" />
      <div className="relative w-full max-w-md rounded-t-3xl bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl sm:p-7">
        <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-3 top-3" aria-label="Close"><X className="size-5" /></Button>
        <div className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-700"><ShieldCheck className="size-6" /></div>
        <h2 id="auth-required-title" className="mt-5 text-2xl font-black">Sign in to {action}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">You can browse Marketlift as a guest. An account is only required for actions that interact with sellers, listings or marketplace moderation.</p>
        <div className="mt-6 grid gap-2">
          <Button asChild><Link href={`/login?returnTo=${encodeURIComponent(returnTo)}`}>Log in</Link></Button>
          <Button variant="outline" asChild><Link href={`/register?returnTo=${encodeURIComponent(returnTo)}`}>Create account</Link></Button>
          <Button variant="ghost" onClick={onClose}>Keep browsing</Button>
        </div>
      </div>
    </div>
  );
}
