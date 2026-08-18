import Link from 'next/link';
import { AlertCircle, CheckCircle2, Inbox, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PageLoading({ label = 'Loading content' }: { label?: string }) {
  return (
    <div className="grid min-h-56 place-items-center rounded-2xl border bg-white p-8" role="status" aria-live="polite">
      <div className="text-center">
        <LoaderCircle className="mx-auto size-7 animate-spin text-blue-600" aria-hidden="true" />
        <p className="mt-3 text-sm font-semibold text-slate-700">{label}</p>
      </div>
    </div>
  );
}

export function InlineError({ title = 'Something went wrong', description = 'Please try again.', onRetry }: { title?: string; description?: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5" role="alert">
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 size-5 shrink-0 text-rose-700" aria-hidden="true" />
        <div>
          <p className="font-bold text-rose-950">{title}</p>
          <p className="mt-1 text-sm leading-6 text-rose-800">{description}</p>
          {onRetry && <Button variant="outline" className="mt-4 border-rose-200 bg-white" onClick={onRetry}>Try again</Button>}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title, description, href, action }: { title: string; description: string; href?: string; action?: string }) {
  return (
    <div className="rounded-3xl border border-dashed bg-white px-6 py-12 text-center">
      <Inbox className="mx-auto size-10 text-slate-300" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-bold text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {href && action && <Button className="mt-5" asChild><Link href={href}>{action}</Link></Button>}
    </div>
  );
}

export function SuccessNotice({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950" role="status" aria-live="polite">
      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" aria-hidden="true" />
      <div><p className="font-bold">{title}</p>{description && <p className="mt-1 text-sm leading-6 text-emerald-800">{description}</p>}</div>
    </div>
  );
}
