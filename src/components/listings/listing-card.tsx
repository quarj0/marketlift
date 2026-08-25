"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, LoaderCircle, MapPin, ShieldCheck } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AuthRequiredDialog } from "@/components/auth/auth-required-dialog";
import { formatRelativeDate } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { useLocale } from "@/providers/locale-provider";
import { useMarket } from "@/providers/market-provider";
import { socialService } from "@/services/social.service";
import type { Listing, Seller } from "@/types";

export function ListingCard({
  listing,
  seller,
  variant = "grid",
}: {
  listing: Listing;
  seller?: Seller | null;
  variant?: "grid" | "list";
}) {
  const list = variant === "list";
  const { isAuthenticated } = useAuth();
  const { t, locale } = useLocale();
  const { formatMoney } = useMarket();
  const [authOpen, setAuthOpen] = useState(false);
  const queryClient = useQueryClient();

  const savedQuery = useQuery({
    queryKey: ["saved-listing-ids"],
    queryFn: socialService.getSavedIds,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const saved = savedQuery.data?.includes(listing.id) ?? false;

  const saveMutation = useMutation({
    mutationFn: () => socialService.toggleSaved(listing.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-listing-ids"] });
      queryClient.invalidateQueries({ queryKey: ["saved-listings"] });
    },
  });

  function toggleSaved() {
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    if (!saveMutation.isPending) saveMutation.mutate();
  }

  return (
    <>
      <article
        className={`group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md ${list ? "sm:grid sm:grid-cols-[240px_1fr]" : ""}`}
      >
        <div
          className={`relative overflow-hidden bg-slate-100 ${list ? "aspect-16/10 sm:aspect-auto sm:min-h-44" : "aspect-4/3"}`}
        >
          <Link
            href={`/listing/${listing.slug}`}
            className="relative block h-full"
            aria-label={t("listing.view", { title: listing.title })}
          >
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
              sizes={
                list
                  ? "(min-width:640px) 240px, 100vw"
                  : "(max-width:640px) 50vw, 25vw"
              }
            />
          </Link>

          <button
            type="button"
            onClick={toggleSaved}
            disabled={saveMutation.isPending}
            aria-label={
              saved
                ? t("listing.unsave", { title: listing.title })
                : t("listing.save", { title: listing.title })
            }
            aria-pressed={saved}
            className="absolute right-2.5 top-2.5 grid size-11 place-items-center rounded-full bg-white/95 text-slate-700 shadow-md transition hover:bg-white focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-60"
          >
            {saveMutation.isPending ? (
              <LoaderCircle className="size-5 animate-spin" />
            ) : (
              <Heart
                className={`size-5 ${saved ? "fill-rose-500 text-rose-500" : ""}`}
              />
            )}
          </button>

          <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
            {listing.featured && (
              <span className="rounded-lg bg-amber-400 px-2 py-1 text-[10px] font-black text-amber-950 sm:text-xs">
                {t("listing.featured")}
              </span>
            )}
            {listing.urgent && (
              <span className="rounded-lg bg-rose-600 px-2 py-1 text-[10px] font-black text-white sm:text-xs">
                {t("listing.urgent")}
              </span>
            )}
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <p className="text-lg font-black tracking-tight text-slate-950 sm:text-xl">
            {formatMoney(listing.price)}
          </p>
          <Link
            href={`/listing/${listing.slug}`}
            className={`mt-1 line-clamp-2 block font-semibold leading-5 text-slate-800 hover:text-brand-700 ${list ? "text-lg" : "min-h-10 text-sm sm:min-h-12 sm:text-base"}`}
          >
            {listing.title}
          </Link>

          {list && (
            <p className="mt-2 line-clamp-2 text-sm text-slate-500">
              {listing.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-1 text-[11px] text-slate-500 sm:text-xs">
            <MapPin className="size-3.5 shrink-0" />
            {listing.location.city}, {listing.location.stateCode}
            <span aria-hidden="true">·</span>
            {formatRelativeDate(listing.createdAt, locale)}
          </div>

          {seller?.verified && (
            <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-emerald-700 sm:text-xs">
              <ShieldCheck className="size-4" />
              {t("listing.verifiedSeller")}
            </div>
          )}
        </div>
      </article>

      <AuthRequiredDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        action="save this listing"
      />
    </>
  );
}
