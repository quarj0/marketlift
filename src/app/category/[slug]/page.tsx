import type { Metadata } from "next";
import { Suspense } from "react";

import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { SearchResultsClient } from "@/components/search/search-results-client";
import { translate } from "@/i18n/translations";
import { categoryService } from "@/services/category.service";

type CategoryPageProps = { params: Promise<{ slug: string }> };

async function categoryDetails(slug: string) {
  try {
    return await categoryService.getConfiguration(slug);
  } catch {
    return null;
  }
}

function localizedName(slug: string, fallback: string) {
  const translated = translate("pt-BR", `category.${slug}`);
  return translated === `category.${slug}` ? fallback : translated;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await categoryDetails(slug);
  const fallback = category?.name || slug.replaceAll("-", " ");
  const name = localizedName(slug, fallback);
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
