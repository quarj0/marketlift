'use client';
import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Grid2X2, List, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { listingService } from '@/services/listing.service';
import { sellers, categories, brazilLocations } from '@/mocks/data';
import { ListingCard } from '@/components/listings/listing-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ListingCondition, SearchFilters, SellerType } from '@/types';

const sellerMap=new Map(sellers.map(s=>[s.id,s]));
const toNum=(v:string|null)=>v && !Number.isNaN(Number(v)) ? Number(v):undefined;

function useFilters():SearchFilters{
 const p=useSearchParams(); return {q:p.get('q')||'',category:p.get('category')||'',state:p.get('state')||'',city:p.get('city')||'',district:p.get('district')||'',minPrice:toNum(p.get('minPrice')),maxPrice:toNum(p.get('maxPrice')),condition:(p.get('condition')||'') as ListingCondition|'',sellerType:(p.get('sellerType')||'') as SellerType|'',verifiedOnly:p.get('verified')==='1',dateListed:(p.get('date')||'') as SearchFilters['dateListed'],sort:(p.get('sort')||'relevant') as SearchFilters['sort']};
}

export function SearchResultsClient(){
 const router=useRouter(), pathname=usePathname(), searchParams=useSearchParams(); const filters=useFilters();
 const [mobileFilters,setMobileFilters]=useState(false); const [view,setView]=useState<'grid'|'list'>('grid');
 const {data=[],isLoading,isError,refetch}=useQuery({queryKey:['listings',filters],queryFn:()=>listingService.getListings(filters)});
 const selectedState=brazilLocations.find(s=>s.code===filters.state); const cities=selectedState?.cities??[];
 const update=(patch:Record<string,string|undefined>)=>{const n=new URLSearchParams(searchParams.toString());Object.entries(patch).forEach(([k,v])=>{if(v)n.set(k,v);else n.delete(k)});router.replace(`${pathname}?${n.toString()}`,{scroll:false});};
 const clear=()=>router.replace(pathname);
 const locationLabel=filters.city || selectedState?.name || 'Brazil';
 const countText=`${data.length.toLocaleString('pt-BR')} listing${data.length===1?'':'s'} found in ${locationLabel}`;
 const panel=<div className="space-y-5">
   <div><label className="mb-2 block text-sm font-semibold">Keyword</label><Input defaultValue={filters.q} key={`q-${filters.q}`} placeholder="What are you looking for?" onKeyDown={e=>{if(e.key==='Enter')update({q:(e.currentTarget as HTMLInputElement).value})}}/></div>
   <div><label className="mb-2 block text-sm font-semibold">Category</label><select value={filters.category} onChange={e=>update({category:e.target.value})} className="h-11 w-full rounded-xl border bg-white px-3 text-sm"><option value="">All categories</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
   <div className="grid grid-cols-2 gap-2"><div><label className="mb-2 block text-sm font-semibold">State</label><select value={filters.state} onChange={e=>update({state:e.target.value,city:undefined})} className="h-11 w-full rounded-xl border bg-white px-3 text-sm"><option value="">All</option>{brazilLocations.map(s=><option key={s.code} value={s.code}>{s.code}</option>)}</select></div><div><label className="mb-2 block text-sm font-semibold">City</label><select disabled={!filters.state} value={filters.city} onChange={e=>update({city:e.target.value})} className="h-11 w-full rounded-xl border bg-white px-3 text-sm disabled:bg-slate-50"><option value="">All cities</option>{cities.map(c=><option key={c} value={c}>{c}</option>)}</select></div></div>
   <div><label className="mb-2 block text-sm font-semibold">Neighborhood</label><Input defaultValue={filters.district} key={`d-${filters.district}`} placeholder="e.g. Vila Mariana" onKeyDown={e=>{if(e.key==='Enter')update({district:e.currentTarget.value})}}/></div>
   <div><label className="mb-2 block text-sm font-semibold">Price range</label><div className="grid grid-cols-2 gap-2"><Input inputMode="numeric" defaultValue={filters.minPrice} key={`min-${filters.minPrice}`} placeholder="Min" onBlur={e=>update({minPrice:e.target.value})}/><Input inputMode="numeric" defaultValue={filters.maxPrice} key={`max-${filters.maxPrice}`} placeholder="Max" onBlur={e=>update({maxPrice:e.target.value})}/></div></div>
   <div><label className="mb-2 block text-sm font-semibold">Condition</label><select value={filters.condition} onChange={e=>update({condition:e.target.value})} className="h-11 w-full rounded-xl border bg-white px-3 text-sm"><option value="">Any condition</option><option>New</option><option>Like new</option><option>Used</option></select></div>
   <div><label className="mb-2 block text-sm font-semibold">Seller type</label><select value={filters.sellerType} onChange={e=>update({sellerType:e.target.value})} className="h-11 w-full rounded-xl border bg-white px-3 text-sm"><option value="">Any seller</option><option value="individual">Individual</option><option value="business">Business</option></select></div>
   <div><label className="mb-2 block text-sm font-semibold">Date listed</label><select value={filters.dateListed} onChange={e=>update({date:e.target.value})} className="h-11 w-full rounded-xl border bg-white px-3 text-sm"><option value="">Any time</option><option value="today">Today</option><option value="week">Last 7 days</option><option value="month">Last 30 days</option></select></div>
   <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!filters.verifiedOnly} onChange={e=>update({verified:e.target.checked?'1':undefined})} className="size-4 accent-brand-600"/>Verified sellers only</label>
   <Button variant="outline" className="w-full" onClick={clear}><RotateCcw className="size-4"/>Reset filters</Button>
 </div>;
 return <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
  <div className="mb-6 flex items-start justify-between gap-4"><div><h1 className="text-2xl font-black tracking-tight sm:text-3xl">Marketplace results</h1><p className="mt-1 text-sm text-slate-500">{isLoading?'Searching listings…':countText}</p></div><Button variant="outline" className="lg:hidden" onClick={()=>setMobileFilters(true)}><SlidersHorizontal className="size-4"/>Filters</Button></div>
  <div className="grid gap-8 lg:grid-cols-[280px_1fr]"><aside className="hidden self-start rounded-2xl border bg-white p-5 lg:sticky lg:top-32 lg:block"><div className="mb-5 flex items-center justify-between"><h2 className="font-bold">Filters</h2><button type="button" onClick={clear} className="text-xs font-semibold text-brand-700">Clear</button></div>{panel}</aside>
  <section className="min-w-0"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-500">{isLoading?'Loading…':`Showing ${data.length} results`}</p><div className="flex items-center gap-2"><div className="hidden rounded-xl border p-1 sm:flex"><button type="button" aria-pressed={view==='grid'} onClick={()=>setView('grid')} className={`rounded-lg p-2 ${view==='grid'?'bg-slate-100':''}`} aria-label="Grid view"><Grid2X2 className="size-4"/></button><button type="button" aria-pressed={view==='list'} onClick={()=>setView('list')} className={`rounded-lg p-2 ${view==='list'?'bg-slate-100':''}`} aria-label="List view"><List className="size-4"/></button></div><select value={filters.sort} onChange={e=>update({sort:e.target.value})} className="h-10 rounded-xl border bg-white px-3 text-sm"><option value="relevant">Most relevant</option><option value="newest">Newest</option><option value="price_asc">Lowest price</option><option value="price_desc">Highest price</option></select></div></div>
  {isLoading?<div className="grid grid-cols-2 gap-3 md:grid-cols-3">{Array.from({length:6}).map((_,i)=><div key={i} className="overflow-hidden rounded-2xl border bg-white"><div className="aspect-[4/3] animate-pulse bg-slate-100"/><div className="space-y-3 p-4"><div className="h-6 w-1/3 animate-pulse rounded bg-slate-100"/><div className="h-4 animate-pulse rounded bg-slate-100"/><div className="h-3 w-2/3 animate-pulse rounded bg-slate-100"/></div></div>)}</div>:isError?<div className="rounded-2xl border bg-white p-10 text-center"><h2 className="text-xl font-bold">We couldn’t load listings</h2><p className="mt-2 text-slate-500">Please try again.</p><Button className="mt-5" onClick={()=>refetch()}>Retry</Button></div>:data.length?<div className={view==='grid'?'grid grid-cols-2 gap-3 md:grid-cols-3':'grid gap-3'}>{data.map(l=><ListingCard key={l.id} listing={l} seller={sellerMap.get(l.sellerId)} variant={view}/>)}</div>:<div className="rounded-2xl border bg-white p-10 text-center"><h2 className="text-xl font-bold">No listings found</h2><p className="mt-2 text-slate-500">Try a broader location, price range or category.</p><Button variant="outline" className="mt-5" onClick={clear}>Clear filters</Button></div>}
  </section></div>
  {mobileFilters&&<div className="fixed inset-0 z-[100] bg-slate-950/40 lg:hidden"><button type="button" className="absolute inset-0" onClick={()=>setMobileFilters(false)} aria-label="Close filters"/><div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-8"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-bold">Filters</h2><p className="text-xs text-slate-500">Refine marketplace results</p></div><Button variant="ghost" size="sm" onClick={()=>setMobileFilters(false)}><X className="size-5"/></Button></div>{panel}<Button className="mt-5 w-full" onClick={()=>setMobileFilters(false)}>Show {data.length} results</Button></div></div>}
 </main>;
}
