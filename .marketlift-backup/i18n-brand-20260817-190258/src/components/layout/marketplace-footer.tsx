import Link from 'next/link';
import { Facebook, Instagram, Linkedin, ShieldCheck } from 'lucide-react';
import { MarketliftLogo } from '@/components/marketplace/logo';

const groups = [
  {
    title: 'Marketplace',
    links: [
      ['Browse listings', '/search'],
      ['Vehicles', '/search?category=vehicles'],
      ['Properties', '/search?category=properties'],
      ['Mobile phones', '/search?category=phones'],
      ['Sell on Marketlift', '/selling/start'],
    ],
  },
  {
    title: 'Account',
    links: [
      ['Log in', '/login'],
      ['Create account', '/register'],
      ['Saved listings', '/account/saved'],
      ['Messages', '/messages'],
      ['Selling', '/selling/start'],
    ],
  },
  {
    title: 'Safety & support',
    links: [
      ['Safety tips', '/safety'],
      ['Help center', '/help'],
      ['Report a problem', '/help/report'],
      ['Terms of use', '/terms'],
      ['Privacy', '/privacy'],
    ],
  },
] as const;

export function MarketplaceFooter() {
  return (
    <footer className="border-t bg-white pb-20 lg:pb-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_2fr] lg:px-8">
        <div>
          <MarketliftLogo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
            A simple, trusted way to discover local products and connect with sellers across Brazil.
          </p>
          <div className="mt-5 flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-sm text-brand-900">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand-700" />
            <span>Marketlift does not hold product payments or provide escrow in V1.</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-bold text-slate-900">{group.title}</h2>
              <ul className="mt-4 space-y-3">
                {group.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-slate-500 transition hover:text-brand-700">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© 2026 Marketlift · K&C. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="mr-1">Brazil · R$ BRL</span>
            <a href="#" aria-label="Instagram" className="rounded-lg p-2 hover:bg-slate-100"><Instagram className="size-4" /></a>
            <a href="#" aria-label="Facebook" className="rounded-lg p-2 hover:bg-slate-100"><Facebook className="size-4" /></a>
            <a href="#" aria-label="LinkedIn" className="rounded-lg p-2 hover:bg-slate-100"><Linkedin className="size-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
