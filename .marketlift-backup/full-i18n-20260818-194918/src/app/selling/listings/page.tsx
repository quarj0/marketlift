"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Pause,
  Pencil,
  Play,
  Plus,
  Rocket,
  Trash2,
} from "lucide-react";
import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { SellingSidebar } from "@/components/selling/selling-sidebar";
import { PromotionModal } from "@/components/payments/promotion-modal";
import { sellingService } from "@/services/selling.service";
import { Button } from "@/components/ui/button";
import type { PromotionOption, SellerListing } from "@/types";

const filters = [
  "All",
  "Published",
  "Draft",
  "Under review",
  "Paused",
  "Sold",
  "Expired",
] as const;

type Filter = (typeof filters)[number];

type RowAction = { id: string; action: "status" | "delete" } | null;

export default function SellerListings() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>("All");
  const [promoting, setPromoting] = useState<SellerListing>();
  const [activePromos, setActivePromos] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [rowAction, setRowAction] = useState<RowAction>(null);

  const query = useQuery({
    queryKey: ["selling-listings"],
    queryFn: sellingService.getListings,
  });
  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: SellerListing["status"];
    }) => sellingService.setStatus(id, status),
    onMutate: ({ id }) => setRowAction({ id, action: "status" }),
    onSettled: async () => {
      setRowAction(null);
      await queryClient.invalidateQueries({ queryKey: ["selling-listings"] });
      await queryClient.invalidateQueries({ queryKey: ["selling-dashboard"] });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => sellingService.deleteListing(id),
    onMutate: (id) => setRowAction({ id, action: "delete" }),
    onSuccess: () => setConfirmDelete(null),
    onSettled: async () => {
      setRowAction(null);
      await queryClient.invalidateQueries({ queryKey: ["selling-listings"] });
      await queryClient.invalidateQueries({ queryKey: ["selling-dashboard"] });
    },
  });

  const filterStatus =
    filter === "Under review"
      ? "under_review"
      : filter.toLowerCase().replace(" ", "_");
  const rows = query.data?.filter(
    (listing) => filter === "All" || listing.status === filterStatus,
  );

  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
        <div className="mb-5 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[.14em] text-blue-700 sm:text-sm">
              Selling
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
              My listings
            </h1>
            <p className="mt-1 text-sm leading-6 text-slate-500 sm:text-base">
              Manage publication status, visibility and performance.
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/selling/listings/new">
              <Plus className="size-4" />
              Add listing
            </Link>
          </Button>
        </div>

        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <SellingSidebar />
          <section
            className="min-w-0 overflow-hidden rounded-2xl border bg-white shadow-sm"
            aria-labelledby="listing-manager-title"
          >
            <h2 id="listing-manager-title" className="sr-only">
              Listing manager
            </h2>
            <div className="marketlift-scrollbar overflow-x-auto border-b px-3 py-3 sm:px-4">
              <div
                className="flex min-w-max gap-2"
                role="tablist"
                aria-label="Filter listings by status"
              >
                {filters.map((item) => (
                  <button
                    key={item}
                    type="button"
                    role="tab"
                    aria-selected={filter === item}
                    onClick={() => setFilter(item)}
                    className={`min-h-10 rounded-full px-4 py-2 text-xs font-black transition ${filter === item ? "bg-blue-700 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-800"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {query.isLoading && (
              <div
                className="space-y-0 divide-y"
                aria-busy="true"
                aria-label="Loading listings"
              >
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-44 animate-pulse bg-slate-50 sm:h-32"
                  />
                ))}
              </div>
            )}

            {query.isError && (
              <div className="px-5 py-14 text-center" role="alert">
                <AlertCircle
                  className="mx-auto size-9 text-rose-500"
                  aria-hidden="true"
                />
                <h3 className="mt-3 font-black">
                  Could not load your listings
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Try again without losing your current filter.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => query.refetch()}
                >
                  Try again
                </Button>
              </div>
            )}

            {!query.isLoading && !query.isError && rows?.length === 0 && (
              <div className="px-5 py-14 text-center">
                <h3 className="font-black">
                  No {filter === "All" ? "" : filter.toLowerCase()} listings
                </h3>
                <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                  Listings matching this status will appear here.
                </p>
                {filter !== "All" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() => setFilter("All")}
                  >
                    Show all listings
                  </Button>
                )}
              </div>
            )}

            <div className="divide-y">
              {rows?.map((listing) => {
                const statusBusy =
                  rowAction?.id === listing.id && rowAction.action === "status";
                const deleteBusy =
                  rowAction?.id === listing.id && rowAction.action === "delete";
                return (
                  <article key={listing.id} className="p-4 sm:p-5">
                    <div className="grid min-w-0 grid-cols-[96px_minmax(0,1fr)] gap-3 sm:grid-cols-[104px_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
                      <Image
                        src={listing.images[0]}
                        width={96}
                        height={96}
                        alt="product image"
                        className="rounded-xl object-cover sm:h-24 sm:w-26"
                      />
                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
                          <h3 className="min-w-0 basis-full truncate text-sm font-black sm:basis-auto sm:text-base">
                            {listing.title}
                          </h3>
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black capitalize text-slate-600">
                            {listing.status.replace("_", " ")}
                          </span>
                          {activePromos[listing.id] && (
                            <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-black text-amber-800">
                              {activePromos[listing.id]}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm font-black text-blue-700">
                          R$ {listing.price.toLocaleString("pt-BR")}
                        </p>
                        <p className="mt-1.5 text-[11px] leading-5 text-slate-500 sm:text-xs">
                          {listing.views} views · {listing.favorites} saves ·{" "}
                          {listing.inquiries} enquiries
                        </p>
                      </div>

                      <div className="col-span-2 mt-1 grid grid-cols-3 gap-2 sm:col-span-1 sm:mt-0 sm:flex sm:flex-wrap sm:justify-end">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/listing/${listing.slug}`}>View</Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/selling/listings/${listing.id}/edit`}>
                            <Pencil className="size-4" />
                            <span className="hidden min-[360px]:inline">
                              Edit
                            </span>
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          onClick={() => setPromoting(listing)}
                        >
                          <Rocket className="size-4" />
                          <span className="hidden min-[360px]:inline">
                            Promote
                          </span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          type="button"
                          className="col-span-2 sm:col-span-1"
                          loading={statusBusy}
                          loadingText={
                            listing.status === "paused"
                              ? "Resuming…"
                              : "Pausing…"
                          }
                          disabled={deleteBusy}
                          onClick={() =>
                            statusMutation.mutate({
                              id: listing.id,
                              status:
                                listing.status === "paused"
                                  ? "published"
                                  : "paused",
                            })
                          }
                        >
                          {listing.status === "paused" ? (
                            <Play className="size-4" />
                          ) : (
                            <Pause className="size-4" />
                          )}
                          {listing.status === "paused" ? "Resume" : "Pause"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          type="button"
                          className="text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                          disabled={statusBusy || deleteBusy}
                          onClick={() => setConfirmDelete(listing.id)}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    {confirmDelete === listing.id && (
                      <div
                        className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3"
                        role="alertdialog"
                        aria-label={`Delete ${listing.title}`}
                      >
                        <p className="text-sm font-bold text-rose-900">
                          Delete this listing?
                        </p>
                        <p className="mt-1 text-xs leading-5 text-rose-700">
                          This demo removes it from your selling list. In
                          production this action should require backend
                          confirmation.
                        </p>
                        <div className="mt-3 flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            loading={deleteBusy}
                            loadingText="Deleting…"
                            onClick={() => deleteMutation.mutate(listing.id)}
                          >
                            Delete listing
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="bg-white"
                            disabled={deleteBusy}
                            onClick={() => setConfirmDelete(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {promoting && (
        <PromotionModal
          listingTitle={promoting.title}
          onClose={() => setPromoting(undefined)}
          onSuccess={(promotion: PromotionOption) =>
            setActivePromos((current) => ({
              ...current,
              [promoting.id]: promotion.name,
            }))
          }
        />
      )}
    </MarketplaceShell>
  );
}
