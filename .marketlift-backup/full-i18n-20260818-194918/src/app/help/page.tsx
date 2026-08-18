import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  MessageCircle,
  Search,
  ShieldCheck,
  Store,
  UserRound,
} from 'lucide-react';
import { MarketplaceShell } from '@/components/layout/marketplace-shell';
import { Input } from '@/components/ui/input';

export const instant = false;

type HelpTopic = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const topics: HelpTopic[] = [
  {
    icon: UserRound,
    title: 'Account & login',
    description: 'Registration, password resets and account settings.',
  },
  {
    icon: Store,
    title: 'Selling',
    description: 'Posting, editing, plans, promotions and seller verification.',
  },
  {
    icon: MessageCircle,
    title: 'Messages',
    description: 'Contacting sellers, blocking users and conversation safety.',
  },
  {
    icon: ShieldCheck,
    title: 'Safety',
    description: 'Avoiding scams, reporting suspicious activity and meeting safely.',
  },
  {
    icon: BookOpen,
    title: 'Marketplace rules',
    description: 'Listings, prohibited content, moderation and reviews.',
  },
];

export default function Help() {
  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-700">
            Support
          </p>
          <h1 className="mt-2 text-4xl font-black">How can we help?</h1>
          <div className="relative mt-6">
            <Search className="absolute left-4 top-3.5 size-5 text-slate-400" />
            <Input
              className="h-12 pl-11"
              placeholder="Search Marketlift help..."
              aria-label="Search Marketlift help"
            />
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-2xl border bg-white p-5 shadow-sm">
              <Icon className="size-6 text-brand-600" />
              <h2 className="mt-3 font-black">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
            </article>
          ))}
        </div>

        <section className="mt-10 rounded-3xl bg-slate-950 p-7 text-white sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black">Still need help?</h2>
            <p className="mt-1 text-sm text-slate-300">
              Report a marketplace problem or suspicious activity to our moderation team.
            </p>
          </div>
          <Link
            href="/help/report"
            className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950 sm:mt-0"
          >
            Report a problem
          </Link>
        </section>
      </main>
    </MarketplaceShell>
  );
}
