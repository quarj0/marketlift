'use client';

import Link from 'next/link';
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Car,
  ChevronRight,
  Flag,
  Grid3X3,
  Laptop,
  Map as MapIcon,
  MapPin,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sofa,
  Store,
  Tractor,
  Tv,
  UserCheck,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SearchBar } from '@/components/search/search-bar';
import { ListingCard } from '@/components/listings/listing-card';
import { SellerCard } from '@/components/seller/seller-card';
import { Button } from '@/components/ui/button';
import { listingService } from '@/services/listing.service';
import { sellerService } from '@/services/seller.service';
import { marketplaceService } from '@/services/marketplace.service';
import type { Category, Listing, Seller } from '@/types';

const icons = {
  Smartphone,
  Tv,
  Laptop,
  Car,
  Building2,
  Map: MapIcon,
  Sofa,
  Shirt,
  Wrench,
  BriefcaseBusiness,
  Tractor,
  Store,
  Grid3X3,
};

function SectionHeading({ eyebrow, title, description, href, action = 'View all' }: { eyebrow: string; title: string; description?: string; href?: string; action?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-700">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{description}</p>}
      </div>
      {href && (
        <Link href={href} className="hidden shrink-0 items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-800 sm:flex">
          {action}<ChevronRight className="size-4" />
        </Link>
      )}
    </div>
  );
}

function ListingSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="aspect-[4/3] animate-pulse bg-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-6 w-2/5 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}

function SellerSkeleton() {
  return <div className="h-44 animate-pulse rounded-2xl border bg-white p-5 shadow-sm"><div className="flex gap-4"><div className="size-14 rounded-full bg-slate-200"/><div className="flex-1 space-y-2 pt-1"><div className="h-4 w-1/2 rounded bg-slate-200"/><div className="h-4 w-1/3 rounded bg-slate-100"/></div></div><div className="mt-6 h-10 rounded-xl bg-slate-100"/></div>;
}

function ListingSection({ listings, sellers, loading, emptyMessage }: { listings?: Listing[]; sellers?: Seller[]; loading: boolean; emptyMessage: string }) {
  if (loading) return <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <ListingSkeleton key={index} />)}</div>;
  if (!listings?.length) return <div className="rounded-2xl border border-dashed bg-white px-6 py-12 text-center text-sm text-slate-500">{emptyMessage}</div>;
  const sellerMap = new Map((sellers ?? []).map((seller) => [seller.id, seller]));
  return <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{listings.map((listing) => <ListingCard key={listing.id} listing={listing} seller={sellerMap.get(listing.sellerId)} />)}</div>;
}

function ErrorCard({ onRetry }: { onRetry: () => void }) {
  return <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6"><p className="font-bold text-rose-900">We couldn’t load this section.</p><p className="mt-1 text-sm text-rose-700">Please try again. Your browsing session is safe.</p><Button variant="outline" className="mt-4" onClick={onRetry}>Try again</Button></div>;
}

function CategoryGrid({ categories, loading }: { categories?: Category[]; loading: boolean }) {
  if (loading) return <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">{Array.from({ length: 13 }).map((_, i) => <div key={i} className="min-h-28 animate-pulse rounded-2xl border bg-white" />)}</div>;
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
      {categories?.map((category) => {
        const Icon = icons[category.icon as keyof typeof icons] ?? Grid3X3;
        return (
          <Link key={category.id} href={`/search?category=${category.id}`} className="group flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl border bg-white p-3 text-center shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-100"><Icon className="size-5" /></span>
            <span className="text-xs font-bold text-slate-800 sm:text-sm">{category.name}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function HomepageContent() {
  const categoriesQuery = useQuery({ queryKey: ['marketplace', 'categories'], queryFn: marketplaceService.getCategories });
  const sellersQuery = useQuery({ queryKey: ['sellers'], queryFn: () => sellerService.getVerified() });
  const allSellersQuery = useQuery({ queryKey: ['sellers', 'all'], queryFn: sellerService.getSellers });
  const nearbyQuery = useQuery({ queryKey: ['listings', 'nearby', 'SP'], queryFn: () => listingService.getNearby('SP', 4) });
  const featuredQuery = useQuery({ queryKey: ['listings', 'featured'], queryFn: listingService.getFeatured });
  const recentQuery = useQuery({ queryKey: ['listings', 'recent'], queryFn: () => listingService.getRecent(4) });

  const sectionError = nearbyQuery.isError || featuredQuery.isError || recentQuery.isError || sellersQuery.isError || categoriesQuery.isError;

  return (
    <main className="overflow-hidden">
      <section className="relative isolate overflow-hidden bg-brand-800 text-white">
        <div className="absolute inset-0 -z-10 opacity-25" aria-hidden="true">
          <div className="absolute -right-24 top-8 size-80 rounded-full bg-brand-400 blur-3xl" />
          <div className="absolute -left-20 bottom-0 size-72 rounded-full bg-emerald-200 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_.85fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-bold backdrop-blur"><ShoppingBag className="size-4" />Local buying and selling, made simpler</span>
              <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">Find great deals from people and businesses near you.</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-brand-50 sm:text-lg">Explore cars, phones, homes, electronics and everyday items across Brazil—without unnecessary friction.</p>
              <div className="mt-8 max-w-5xl"><SearchBar /></div>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-brand-100"><span className="font-semibold text-white">Popular:</span><Link className="hover:text-white" href="/search?q=iPhone+15">iPhone 15</Link><Link className="hover:text-white" href="/search?q=Honda+Civic">Honda Civic</Link><Link className="hover:text-white" href="/search?category=properties">Apartments</Link><Link className="hover:text-white" href="/search?q=Samsung+S24">Samsung S24</Link></div>
            </div>
            <div className="hidden lg:block">
              <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 rounded-2xl bg-white p-5 text-slate-950"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">Marketplace snapshot</p><div className="mt-4 grid grid-cols-3 gap-4"><div><p className="text-2xl font-black">13</p><p className="text-xs text-slate-500">Categories</p></div><div><p className="text-2xl font-black">9</p><p className="text-xs text-slate-500">Key regions</p></div><div><p className="text-2xl font-black">24/7</p><p className="text-xs text-slate-500">Browsing</p></div></div></div>
                  <div className="rounded-2xl bg-slate-950/70 p-4"><ShieldCheck className="size-6 text-brand-300"/><p className="mt-3 font-bold">Seller verification</p><p className="mt-1 text-xs leading-5 text-slate-300">See verification status before you contact a seller.</p></div>
                  <div className="rounded-2xl bg-slate-950/70 p-4"><MapPin className="size-6 text-brand-300"/><p className="mt-3 font-bold">Browse nearby</p><p className="mt-1 text-xs leading-5 text-slate-300">Discover listings by state, city and neighborhood.</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-0 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {[['Verified seller status', ShieldCheck], ['Location-first discovery', MapPin], ['Simple reporting', Flag], ['Built for local commerce', Users]].map(([label, Icon], i) => {
            const I = Icon as typeof ShieldCheck;
            return <div key={String(label)} className={`flex items-center gap-3 py-4 text-sm font-semibold text-slate-700 ${i % 2 === 0 ? 'pr-3' : 'pl-3'} md:px-4`}><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><I className="size-4"/></span>{String(label)}</div>;
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <SectionHeading eyebrow="Explore" title="Browse categories" description="Jump straight into the things people buy and sell every day." href="/search" />
        {categoriesQuery.isError ? <ErrorCard onRetry={() => categoriesQuery.refetch()} /> : <CategoryGrid categories={categoriesQuery.data} loading={categoriesQuery.isLoading} />}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <SectionHeading eyebrow="São Paulo, SP" title="Listings near you" description="Fresh listings around your selected area." href="/search?state=SP" />
        {nearbyQuery.isError ? <ErrorCard onRetry={() => nearbyQuery.refetch()} /> : <ListingSection listings={nearbyQuery.data} sellers={allSellersQuery.data} loading={nearbyQuery.isLoading || allSellersQuery.isLoading} emptyMessage="No nearby listings yet. Try another location." />}
      </section>

      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Premium picks" title="Featured listings" description="Promoted listings receiving extra visibility across Marketlift." href="/search?featured=true" action="See featured" />
          {featuredQuery.isError ? <ErrorCard onRetry={() => featuredQuery.refetch()} /> : <ListingSection listings={featuredQuery.data} sellers={allSellersQuery.data} loading={featuredQuery.isLoading || allSellersQuery.isLoading} emptyMessage="There are no featured listings right now." />}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <SectionHeading eyebrow="Just in" title="Recently added" description="See what sellers have posted most recently." href="/search?sort=newest" action="Browse newest" />
        {recentQuery.isError ? <ErrorCard onRetry={() => recentQuery.refetch()} /> : <ListingSection listings={recentQuery.data} sellers={allSellersQuery.data} loading={recentQuery.isLoading || allSellersQuery.isLoading} emptyMessage="No recent listings yet." />}
      </section>

      <section className="border-y bg-slate-100/70 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Trusted community" title="Verified sellers" description="Verification helps buyers understand who has completed Marketlift's seller identity checks." href="/search?verifiedOnly=true" action="View listings" />
          {sellersQuery.isError ? <ErrorCard onRetry={() => sellersQuery.refetch()} /> : sellersQuery.isLoading ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <SellerSkeleton key={i}/>)}</div> : sellersQuery.data?.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{sellersQuery.data.map((seller) => <SellerCard key={seller.id} seller={seller}/>)}</div> : <div className="rounded-2xl border border-dashed bg-white p-10 text-center text-sm text-slate-500">No verified sellers to show yet.</div>}
        </div>
      </section>

      <section className="bg-slate-950 py-14 text-white lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:px-8">
          <div className="self-center"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-300">Trade with confidence</p><h2 className="mt-3 max-w-xl text-3xl font-black tracking-tight sm:text-4xl">Useful safety signals without getting in your way.</h2><p className="mt-4 max-w-xl leading-7 text-slate-300">Marketlift gives buyers better context through seller verification status, reporting tools and marketplace moderation. Product payment and delivery remain arrangements between buyers and sellers in V1.</p><Button variant="outline" className="mt-6 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white" asChild><Link href="/safety">Read our safety guidance</Link></Button></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [UserCheck, 'Verified sellers', 'See when a seller has completed Marketlift identity verification.'],
              [ShieldCheck, 'Safer profiles', 'Review seller history, ratings and marketplace activity.'],
              [Flag, 'Easy reporting', 'Report suspicious listings, sellers or messages from one place.'],
              [BadgeCheck, 'Marketplace moderation', 'Admin tools support review and moderation workflows.'],
            ].map(([Icon, title, body]) => { const I = Icon as typeof ShieldCheck; return <div key={String(title)} className="rounded-2xl border border-white/10 bg-white/[.05] p-5"><span className="grid size-10 place-items-center rounded-xl bg-brand-400/10 text-brand-300"><I className="size-5"/></span><h3 className="mt-4 font-bold">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{String(body)}</p></div>; })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="relative overflow-hidden rounded-[2rem] border border-brand-100 bg-brand-50 p-7 sm:p-10 lg:p-12">
          <div className="absolute -right-14 -top-16 size-56 rounded-full bg-brand-200/60 blur-3xl" aria-hidden="true" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl"><span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-brand-700 shadow-sm"><Zap className="size-3.5"/>Start selling</span><h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Turn unused items into new opportunities.</h2><p className="mt-4 text-base leading-7 text-slate-600">Use your existing Marketlift account to publish listings, manage enquiries and add more capacity only when you need it.</p><div className="mt-6 flex flex-wrap gap-3"><Button size="lg" asChild><Link href="/selling/listings/new">Post a listing</Link></Button><Button size="lg" variant="outline" asChild><Link href="/selling/start">Explore selling tools</Link></Button></div></div>
            <div className="hidden min-w-64 rounded-2xl border bg-white p-5 shadow-sm lg:block"><p className="text-sm font-bold text-slate-950">Seller journey</p><div className="mt-4 space-y-4 text-sm text-slate-600">{[['1', 'Create your listing'], ['2', 'Connect with interested buyers'], ['3', 'Arrange payment and delivery directly']].map(([number, text]) => <div key={number} className="flex items-center gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 font-black text-brand-700">{number}</span>{text}</div>)}</div></div>
          </div>
        </div>
      </section>

      {sectionError && <div className="sr-only" role="status">Some homepage content could not be loaded.</div>}
    </main>
  );
}
