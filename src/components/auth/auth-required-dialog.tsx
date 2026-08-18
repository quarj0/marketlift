'use client';

import Link from 'next/link';
import { ShieldCheck, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLocale } from '@/providers/locale-provider';

export function AuthRequiredDialog({
  open,
  onClose,
  action = 'continue',
}: {
  open: boolean;
  onClose: () => void;
  action?: string;
}) {
  const { t, tr } = useLocale();

  const returnTo =
    typeof window !== 'undefined'
      ? `${window.location.pathname}${window.location.search}`
      : '';

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="top-auto bottom-0 left-0 w-full max-w-none translate-x-0 translate-y-0 gap-0 rounded-b-none rounded-t-3xl p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:top-1/2 sm:left-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:p-7"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-3 top-3"
          aria-label={t('common.close')}
        >
          <X className="size-5" aria-hidden="true" />
        </Button>

        <div className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          <ShieldCheck className="size-6" aria-hidden="true" />
        </div>

        <DialogTitle className="mt-5 pr-10 text-2xl font-black text-slate-950">
          {t('auth.required.title', { action: tr(action) })}
        </DialogTitle>

        <DialogDescription className="mt-2 text-sm leading-6 text-slate-600">
          {t('auth.required.body')}
        </DialogDescription>

        <div className="mt-6 grid gap-2">
          <Button asChild>
            <Link href={`/login?returnTo=${encodeURIComponent(returnTo)}`}>
              {t('auth.required.login')}
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href={`/register?returnTo=${encodeURIComponent(returnTo)}`}>
              {t('auth.required.create')}
            </Link>
          </Button>

          <Button variant="ghost" onClick={onClose}>
            {t('auth.required.browse')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
