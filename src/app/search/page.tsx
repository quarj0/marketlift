import { Suspense } from "react";
import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { SearchResultsClient } from "@/components/search/search-results-client";

export default function SearchPage() {
  return (
    <MarketplaceShell>
      <Suspense
        fallback={
          <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="h-10 w-72 animate-pulse rounded-xl bg-slate-100" />
          </main>
        }
      >
        <SearchResultsClient />
      </Suspense>
    </MarketplaceShell>
  );
}
