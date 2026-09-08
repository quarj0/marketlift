"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function SellerProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Seller profile route failed", error);
  }, [error]);

  return (
    <main className="grid min-h-[55vh] place-items-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border bg-white p-7 text-center shadow-sm">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-700">
          <AlertTriangle className="size-6" />
        </span>
        <h1 className="mt-4 text-xl font-black text-slate-950">
          We couldn&apos;t load this seller right now
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          The seller page is temporarily unavailable. You can retry without
          losing your place.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button type="button" onClick={reset}>
            <RotateCcw className="size-4" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/search">Browse listings</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
