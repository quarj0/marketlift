"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listingService } from "@/services/listing.service";
import { sellerService } from "@/services/seller.service";
import { socialService } from "@/services/social.service";
import { formatReadableDate, formatRelativeDate } from "@/lib/utils";
import { releaseFeatures } from "@/lib/release-features";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ListingCard } from "./listing-card";
import { AuthRequiredDialog } from "@/components/auth/auth-required-dialog";
import { ReportDialog } from "@/components/feedback/report-dialog";
import { ListingAvailabilityReport } from "./listing-availability-report";
import { SellerReviewPreview } from "./seller-review-preview";
import { EmptyState, InlineError } from "@/components/feedback/async-states";
import { useAuth } from "@/providers/auth-provider";
import { useLocale } from "@/providers/locale-provider";
import { useMarket } from "@/providers/market-provider";

export function ListingDetailsClient({ slug }: { slug: string }) {
  const { isAuthenticated } = useAuth();
  const { t, locale, tr, categoryName } = useLocale();
  const { formatMoney } = useMarket();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [active, setActive] = useState(0);
  const [gallery, setGallery] = useState(false);
  const [phoneVisible, setPhoneVisible] = useState(false);
  const [authAction, setAuthAction] = useState<string | null>(null);

  const listingQuery = useQuery({
    queryKey: ["listing", slug],
    queryFn: () => listingService.getListing(slug),
  });
  const listing = listingQuery.data;
  const sellerQuery = useQuery({
    queryKey: ["seller", listing?.sellerId],
    queryFn: () => sellerService.getSeller(listing!.sellerId),
    enabled: Boolean(listing?.sellerId),
  });
  const similarQuery = useQuery({
    queryKey: ["similar", listing?.id],
    queryFn: () => listingService.getSimilar(listing!.id),
    enabled: Boolean(listing),
  });
  const savedQuery = useQuery({
    queryKey: ["saved-listing-ids"],
    queryFn: socialService.getSavedIds,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
  const saveMutation = useMutation({
    mutationFn: () => socialService.toggleSaved(listing!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-listing-ids"] });
      queryClient.invalidateQueries({ queryKey: ["saved-listings"] });
    },
  });

  if (listingQuery.isLoading)
    return (
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid animate-pulse gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="aspect-4/3 rounded-3xl bg-slate-200" />
            <div className="h-64 rounded-3xl bg-white" />
          </div>
          <div className="h-96 rounded-3xl bg-white" />
        </div>
      </main>
    );
  if (listingQuery.isError)
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <InlineError
          title={t("listing.loadError")}
          description={t("listing.loadErrorBody")}
          onRetry={() => listingQuery.refetch()}
        />
      </main>
    );
  if (!listing)
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <EmptyState
          title={t("listing.unavailable")}
          description={t("listing.unavailableBody")}
          href="/search"
          action={t("listing.browse")}
        />
      </main>
    );

  const seller = sellerQuery.data;
  const image = listing.images[active] || listing.images[0];
  const saved = savedQuery.data?.includes(listing.id) ?? false;

  function requireAuth(action: string, callback?: () => void) {
    if (!isAuthenticated) {
      setAuthAction(action);
      return;
    }
    callback?.();
  }

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-8">
        <nav
          aria-label={t("listing.breadcrumbLabel")}
          className="mb-4 flex min-w-0 items-center gap-1.5 overflow-hidden text-xs text-slate-500 sm:text-sm"
        >
          <Link
            href="/"
            className="shrink-0 font-medium transition hover:text-brand-700 hover:underline"
          >
            {t("listing.breadcrumbHome")}
          </Link>

          <ChevronRight className="size-3.5 shrink-0 text-slate-300" aria-hidden="true" />

          <Link
            href={`/search?category=${listing.category}`}
            className="shrink-0 font-medium transition hover:text-brand-700 hover:underline"
          >
            {categoryName(listing.category)}
          </Link>

          <ChevronRight className="size-3.5 shrink-0 text-slate-300" aria-hidden="true" />

          <span
            aria-current="page"
            className="min-w-0 truncate font-medium text-slate-700"
            title={listing.title}
          >
            {listing.title}
          </span>
        </nav>

        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0">
            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm sm:rounded-3xl">
              <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100 sm:aspect-16/10">
                <Image
                  src={image}
                  alt={`${listing.title}, image ${active + 1}`}
                  fill
                  loading="eager"
                  fetchPriority="high"
                  className="object-cover"
                  sizes="(min-width:1024px) 70vw, 100vw"
                />

                <button
                  type="button"
                  onClick={() => setGallery(true)}
                  className="absolute inset-0 z-[1] rounded-[inherit] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-brand-400"
                  aria-label={t("listing.galleryOpen")}
                >
                  <span className="sr-only">{t("listing.galleryOpen")}</span>
                </button>

                {listing.images.length > 1 && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setActive(
                          (active - 1 + listing.images.length) %
                            listing.images.length,
                        )
                      }
                      className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-slate-200/80 bg-white/95 text-slate-800 shadow-lg backdrop-blur hover:bg-white hover:text-slate-950"
                      aria-label={t("listing.previousImage")}
                    >
                      <ChevronLeft className="size-5" aria-hidden="true" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setActive((active + 1) % listing.images.length)
                      }
                      className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-slate-200/80 bg-white/95 text-slate-800 shadow-lg backdrop-blur hover:bg-white hover:text-slate-950"
                      aria-label={t("listing.nextImage")}
                    >
                      <ChevronRight className="size-5" aria-hidden="true" />
                    </Button>
                  </>
                )}

                <span className="pointer-events-none absolute bottom-3 right-3 z-20 rounded-full bg-slate-950/75 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                  {active + 1} / {listing.images.length}
                </span>
              </div>
              {listing.images.length > 1 && (
                <div className="marketlift-scrollbar flex gap-2 overflow-x-auto p-3 sm:p-4">
                  {listing.images.map((src, index) => (
                    <button
                      type="button"
                      key={src}
                      onClick={() => setActive(index)}
                      aria-label={t("listing.showImage", { number: index + 1 })}
                      aria-pressed={active === index}
                      className={`relative size-16 shrink-0 overflow-hidden rounded-xl border-2 sm:size-20 ${active === index ? "border-brand-600" : "border-transparent"}`}
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <article className="mt-5 rounded-2xl border bg-white p-5 shadow-sm sm:rounded-3xl sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    {listing.featured && (
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-800">
                        {t("listing.featured")}
                      </span>
                    )}
                    {listing.urgent && (
                      <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-black text-rose-700">
                        {t("listing.urgent")}
                      </span>
                    )}
                  </div>
                  <h1 className="mt-3 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
                    {listing.title}
                  </h1>
                  <p className="mt-3 text-3xl font-black text-brand-700">
                    {formatMoney(listing.price)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  aria-pressed={saved}
                  loading={saveMutation.isPending}
                  loadingText={t("listing.saving")}
                  onClick={() =>
                    requireAuth("save this listing", () =>
                      saveMutation.mutate(),
                    )
                  }
                >
                  <Heart
                    className={`size-4 ${saved ? "fill-rose-500 text-rose-500" : ""}`}
                  />
                  {saved ? t("listing.saved") : t("common.save")}
                </Button>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-y py-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="size-4" />
                  {listing.location.city}, {listing.location.stateCode}
                  {listing.location.district
                    ? ` · ${listing.location.district}`
                    : ""}
                </span>
                <span>{formatRelativeDate(listing.createdAt, locale)}</span>
                <span className="flex items-center gap-1">
                  <Eye className="size-4" />
                  {t("listing.views", { count: listing.views.toLocaleString(locale === "pt-BR" ? "pt-BR" : "en-US") })}
                </span>
              </div>
              <div className="mt-7">
                <h2 className="text-xl font-black">{t("listing.description")}</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base">
                  {listing.description}
                </p>
              </div>
              {listing.specifications && (
                <div className="mt-8">
                  <h2 className="text-xl font-black">{t("listing.specifications")}</h2>
                  <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                    {Object.entries(listing.specifications).map(
                      ([key, value]) => (
                        <div key={key} className="rounded-xl bg-slate-50 p-4">
                          <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            {tr(key)}
                          </dt>
                          <dd className="mt-1 font-semibold">{tr(String(value))}</dd>
                        </div>
                      ),
                    )}
                  </dl>
                </div>
              )}
              <div className="mt-7 flex justify-end border-t pt-5 text-xs text-slate-400">
                <ReportDialog
                  targetType="listing"
                  targetId={listing.id}
                  triggerLabel={t("listing.report")}
                />
              </div>
            </article>

            {seller && <SellerReviewPreview seller={seller} />}
          </section>

          <aside className="self-start lg:sticky lg:top-32">
            {sellerQuery.isLoading ? (
              <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
            ) : sellerQuery.isError ? (
              <InlineError
                title={t("listing.sellerUnavailable")}
                description={t("listing.sellerUnavailableBody")}
                onRetry={() => sellerQuery.refetch()}
              />
            ) : seller ? (
              <div className="rounded-2xl border bg-white p-5 shadow-sm sm:rounded-3xl">
                <div className="flex items-center gap-3">
                  <Image
                    src={seller.avatar}
                    alt={seller.name}
                    width={58}
                    height={58}
                    className="size-14.5 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-black">
                      <span className="truncate">{seller.name}</span>
                      {releaseFeatures.cpfVerification && seller.verified && (
                        <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-sm">
                      <Star className="size-4 fill-amber-400 text-amber-400" />
                      {seller.rating}
                      <span className="text-slate-400">({seller.reviews})</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {seller.location.city}, {seller.location.stateCode}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-center text-xs">
                  <div>
                    <strong className="block text-sm text-slate-900">
                      {seller.responseRate}%
                    </strong>
                    {t("listing.responseRate")}
                  </div>
                  <div>
                    <strong className="block text-sm text-slate-900">
                      {formatReadableDate(seller.memberSince, locale)}
                    </strong>
                    {t("listing.memberSinceLabel")}
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Button
                    onClick={() =>
                      requireAuth("message the seller", () => {
                        router.push("/messages");
                      })
                    }
                  >
                    <MessageCircle className="size-4" />
                    {t("listing.messageSeller")}
                  </Button>
                  {seller.phone && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setPhoneVisible(true)}
                    >
                      <Phone className="size-4" />
                      {phoneVisible ? seller.phone : t("listing.showContact")}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full"
                    aria-pressed={saved}
                    loading={saveMutation.isPending}
                    loadingText={t("listing.saving")}
                    onClick={() =>
                      requireAuth("save this listing", () =>
                        saveMutation.mutate(),
                      )
                    }
                  >
                    <Heart
                      className={`size-4 ${saved ? "fill-rose-500 text-rose-500" : ""}`}
                    />
                    {saved ? t("listing.saved") : t("listing.saveListing")}
                  </Button>
                </div>
                <Button variant="outline" className="mt-2 w-full" asChild>
                  <Link href={`/seller/${seller.id}`}>{t("listing.viewSeller")}</Link>
                </Button>
              </div>
            ) : null}

            <ListingAvailabilityReport listingId={listing.id} />

            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              <div className="flex gap-2">
                <ShieldAlert className="mt-0.5 size-5 shrink-0" />
                <p>
                  <strong>{t("listing.safetyTitle")}</strong> {t("listing.safetyBody")}
                </p>
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-brand-700">{t("listing.keepBrowsing")}</p>
              <h2 className="text-2xl font-black">{t("listing.similar")}</h2>
            </div>
            <Link
              href={`/search?category=${listing.category}`}
              className="text-sm font-bold text-brand-700 hover:underline"
            >
              {t("listing.viewMore")}
            </Link>
          </div>
          {similarQuery.isLoading ? (
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-72 animate-pulse rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          ) : similarQuery.isError ? (
            <div className="mt-5">
              <InlineError
                title={t("listing.similarUnavailable")}
                description={t("listing.similarUnavailableBody")}
                onRetry={() => similarQuery.refetch()}
              />
            </div>
          ) : similarQuery.data?.length ? (
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {similarQuery.data.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState
                title={t("listing.noSimilar")}
                description={t("listing.noSimilarBody")}
                href={`/search?category=${listing.category}`}
                action={t("listing.browseCategory")}
              />
            </div>
          )}
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-[1fr_1.4fr] gap-2 border-t bg-white/98 p-3 pb-[max(.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(15,23,42,.08)] backdrop-blur lg:hidden">
        <Button variant="outline" onClick={() => setPhoneVisible(true)}>
          <Phone className="size-4" />
          {phoneVisible ? t("listing.callSeller") : t("listing.contact")}
        </Button>
        <Button
          onClick={() =>
            requireAuth("message the seller", () => {
              router.push("/messages");
            })
          }
        >
          <MessageCircle className="size-4" />
          {t("listing.messageSeller")}
        </Button>
      </div>

      <Dialog open={gallery} onOpenChange={setGallery}>
        <DialogContent
          showCloseButton={false}
          className="w-[min(94vw,1120px)] max-w-[94vw] gap-0 rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-white/30 sm:max-w-5xl sm:rounded-3xl"
        >
          <DialogTitle className="sr-only">{t("listing.gallery")}</DialogTitle>
          <DialogDescription className="sr-only">
            {listing.title}
          </DialogDescription>

          <div className="relative h-[min(78dvh,760px)] w-full overflow-hidden rounded-xl bg-black sm:rounded-2xl">
            <Image
              src={image}
              alt={`${listing.title}, image ${active + 1}`}
              fill
              className="object-contain"
              sizes="(min-width: 1024px) 1024px, 94vw"
            />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setGallery(false)}
              className="absolute right-3 top-3 z-20 bg-white/95 text-slate-950 shadow-lg hover:bg-white hover:text-slate-950"
              aria-label={t("listing.closeGallery")}
            >
              <X aria-hidden="true" />
            </Button>

            <span className="absolute bottom-3 right-3 z-10 rounded-full bg-slate-950/75 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
              {active + 1} / {listing.images.length}
            </span>

            {listing.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setActive(
                      (active - 1 + listing.images.length) %
                        listing.images.length,
                    )
                  }
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 bg-white/95 text-slate-950 shadow-lg hover:bg-white hover:text-slate-950"
                  aria-label={t("listing.previousImage")}
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setActive((active + 1) % listing.images.length)
                  }
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 bg-white/95 text-slate-950 shadow-lg hover:bg-white hover:text-slate-950"
                  aria-label={t("listing.nextImage")}
                >
                  <ChevronRight aria-hidden="true" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <AuthRequiredDialog
        open={Boolean(authAction)}
        onClose={() => setAuthAction(null)}
        action={authAction || "continue"}
      />
    </>
  );
}
