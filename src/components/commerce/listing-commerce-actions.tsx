"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PackageCheck, ShieldCheck, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { commerceService } from "@/services/commerce.service";
import { useAuth } from "@/providers/auth-provider";
import { useMarket } from "@/providers/market-provider";

export function ListingCommerceActions({
  listingId,
  price,
}: {
  listingId: string;
  price: number;
}) {
  const { isAuthenticated } = useAuth();
  const { formatMoney } = useMarket();
  const query = useQuery({
    queryKey: ["listing-commerce", listingId],
    queryFn: () => commerceService.getListingCommerce(listingId),
    staleTime: 30_000,
  });

  const commerce = query.data;
  if (!commerce?.checkoutEnabled) return null;

  const checkoutHref = isAuthenticated
    ? `/checkout/${listingId}`
    : `/login?next=${encodeURIComponent(`/checkout/${listingId}`)}`;

  return (
    <aside className="fixed inset-x-3 bottom-[calc(.75rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-md rounded-2xl border border-brand-200 bg-white/95 p-3 shadow-2xl backdrop-blur sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-96 sm:p-4">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
          <ShoppingBag className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-sm font-black text-slate-950">
            Comprar online
            <ShieldCheck className="size-4 text-emerald-600" aria-hidden="true" />
          </div>
          <p className="mt-0.5 text-xs leading-5 text-slate-500">
            Pague pelo Marketlift e acompanhe a entrega. O valor do vendedor só é liberado após a proteção de entrega.
          </p>
        </div>
      </div>
      <Button asChild className="mt-3 w-full">
        <Link href={checkoutHref}>
          <PackageCheck className="size-4" aria-hidden="true" />
          Comprar agora · {formatMoney(price)}
        </Link>
      </Button>
      {commerce.mode === "optional" && (
        <p className="mt-2 text-center text-[11px] font-medium text-slate-500">
          Prefere ver o item primeiro? Você ainda pode conversar com o vendedor e combinar uma inspeção.
        </p>
      )}
    </aside>
  );
}
