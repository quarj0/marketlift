'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import { MarketplaceShell } from '@/components/layout/marketplace-shell';
import { SellingSidebar } from '@/components/selling/selling-sidebar';
import {
  CategoryFields,
  validateCategoryAttributes,
  type CategoryFieldErrors,
} from '@/components/selling/category-fields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { categoryService } from '@/services/category.service';
import type { ListingAttributes } from '@/types';

const initialVehicleAttributes: ListingAttributes = {
  make: 'Honda',
  model: 'Civic',
  year: 2018,
  mileage_km: 72000,
  transmission: 'automatic',
  fuel: 'flex',
  body_type: 'sedan',
  color: 'Silver',
  documents_ready: true,
};

export function EditListingClient() {
  const [saved, setSaved] = useState(false);
  const [attributes, setAttributes] = useState<ListingAttributes>(initialVehicleAttributes);
  const [attributeErrors, setAttributeErrors] = useState<CategoryFieldErrors>({});

  const categoryQuery = useQuery({
    queryKey: ['category-configuration', 'vehicles'],
    queryFn: () => categoryService.getConfiguration('vehicles'),
    staleTime: 5 * 60_000,
  });

  const save = () => {
    if (!categoryQuery.data) return;
    const errors = validateCategoryAttributes(categoryQuery.data, attributes);
    setAttributeErrors(errors);
    if (Object.keys(errors).length) return;
    setSaved(true);
  };

  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
        <div className="mb-5 sm:mb-7">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-700">Selling</p>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Edit listing</h1>
          <p className="mt-1 text-slate-500">Update the listing and its category-specific details. Changes normally stay live after automated validation.</p>
        </div>

        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <SellingSidebar />
          <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-bold">Title</span>
                <Input defaultValue="Honda Civic 2018 Automatic" />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-bold">Price (R$)</span>
                <Input type="number" defaultValue="89000" />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-bold">Condition</span>
                <select className="h-11 w-full rounded-xl border bg-white px-3 text-sm" defaultValue="Used">
                  <option>Used</option><option>Like new</option><option>New</option>
                </select>
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-bold">Description</span>
                <textarea defaultValue="Well maintained, automatic transmission, documents up to date." className="min-h-40 w-full rounded-xl border p-3 text-sm" />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-bold">City</span>
                <Input defaultValue="São Paulo" />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-bold">Neighborhood</span>
                <Input defaultValue="Vila Mariana" />
              </label>
            </div>

            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-black">Vehicle details</h2>
              {categoryQuery.isLoading ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">{[1,2,3,4].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}</div>
              ) : categoryQuery.isError || !categoryQuery.data ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-800">Couldn’t load vehicle fields.</p>
                  <Button type="button" variant="outline" className="mt-3" onClick={() => categoryQuery.refetch()}><RefreshCw className="size-4" /> Retry</Button>
                </div>
              ) : (
                <>
                  <p className="mt-1 text-sm text-slate-500">{categoryQuery.data.description}</p>
                  <div className="mt-4">
                    <CategoryFields
                      config={categoryQuery.data}
                      values={attributes}
                      errors={attributeErrors}
                      onChange={(fieldId, value) => {
                        setAttributes((current) => ({ ...current, [fieldId]: value }));
                        setSaved(false);
                      }}
                    />
                  </div>
                </>
              )}
            </div>

            {saved && (
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-brand-50 p-3 text-sm font-semibold text-brand-800">
                <CheckCircle2 className="size-4" /> Changes saved. Your listing remains live unless automated safety checks detect a reason for review.
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button onClick={save} disabled={categoryQuery.isLoading}>Save changes</Button>
              <Button variant="outline" asChild><Link href="/selling/listings">Cancel</Link></Button>
            </div>
          </section>
        </div>
      </main>
    </MarketplaceShell>
  );
}
