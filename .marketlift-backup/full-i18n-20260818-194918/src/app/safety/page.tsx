import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, Handshake, MapPin, ShieldCheck } from 'lucide-react';
import { MarketplaceShell } from '@/components/layout/marketplace-shell';

export const instant = false;

type SafetyTip = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const tips: SafetyTip[] = [
  {
    icon: ShieldCheck,
    title: 'Check the seller',
    description:
      'Review verification status, profile history and reviews before arranging a deal.',
  },
  {
    icon: Handshake,
    title: 'Inspect before paying',
    description:
      'Never send advance product payments because someone pressures you to move quickly.',
  },
  {
    icon: MapPin,
    title: 'Meet safely',
    description:
      'Use a public location when possible and tell someone where you are going.',
  },
  {
    icon: AlertTriangle,
    title: 'Report suspicious activity',
    description:
      'Fake listings, prohibited items and suspicious messages can be reported directly in Marketlift.',
  },
];

export default function Safety() {
  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm font-bold uppercase tracking-wider text-brand-700">
          Trust & safety
        </p>
        <h1 className="mt-2 text-4xl font-black">Stay safe on Marketlift</h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          Marketlift connects buyers and sellers; it does not process product payments or
          provide escrow in V1. Use these practices before completing a transaction
          independently.
        </p>

        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          {tips.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-2xl border bg-white p-6 shadow-sm">
              <Icon className="size-7 text-brand-600" />
              <h2 className="mt-4 text-lg font-black">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-amber-50 p-5 text-sm leading-6 text-amber-950">
          <b>Important:</b> A Verified Seller badge confirms that identity checks were
          completed; it is not a guarantee of a product or transaction.
        </div>
      </main>
    </MarketplaceShell>
  );
}
