import Image from "next/image";
import Link from "next/link";
import { MapPin, ShieldCheck, Star } from "lucide-react";
import type { Seller } from "@/types";
import { Button } from "@/components/ui/button";

export function SellerCard({ seller }: { seller: Seller }) {
  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <Image
          src={seller.avatar}
          alt={seller.name}
          width={56}
          height={56}
          className="rounded-full"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-bold">{seller.name}</h3>
            {seller.verified && (
              <ShieldCheck className="size-4 shrink-0 text-brand-600" />
            )}
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="size-3.5" />
            {seller.location.city}, {seller.location.stateCode}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1 font-semibold">
          <Star className="size-4 fill-amber-400 text-amber-400" />
          {seller.rating}{" "}
          <span className="font-normal text-slate-400">({seller.reviews})</span>
        </span>
        <span className="text-slate-500">{seller.activeListings} listings</span>
      </div>
      <Button variant="outline" className="mt-4 w-full" asChild>
        <Link href={`/seller/${seller.id}`}>View seller</Link>
      </Button>
    </article>
  );
}
