import type { Metadata } from "next";
import { Suspense } from "react";

import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { SearchResultsClient } from "@/components/search/search-results-client";
import { translate } from "@/i18n/translations";

type CategoryPageProps = { params: Promise<{ slug: string }> };

function localizedName(slug: string) {
  const translated = translate("pt-BR", `category.${slug}`);
  return translated === `category.${slug}`
    ? slug.replaceAll("-", " ")
    : translated;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  // Metadata must remain available even when the marketplace API is slow or
  // temporarily unavailable. The client view loads category data separately.
  const name = localizedName(slug);
  const title = `${name} à venda no Brasil`;
  const description = `Encontre anúncios de ${name.toLocaleLowerCase("pt-BR")} perto de você no Marketlift Brasil.`;

  return {
    title,
    description,
    alternates: { canonical: `/category/${slug}` },
    openGraph: { title, description, url: `/category/${slug}` },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  return (
    <MarketplaceShell>
      <Suspense
        fallback={
          <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="h-10 w-72 animate-pulse rounded-xl bg-slate-100" />
          </main>
        }
      >
        <SearchResultsClient categorySlug={slug} />
      </Suspense>
    </MarketplaceShell>
  );
}
