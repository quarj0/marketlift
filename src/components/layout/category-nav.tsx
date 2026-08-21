"use client";

import Link from "next/link";
import { ChevronDown, Grid3X3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { categoryService } from "@/services/category.service";
import { useLocale } from "@/providers/locale-provider";

export function CategoryNav() {
  const { t, categoryName } = useLocale();
  const query = useQuery({ queryKey: ['categories'], queryFn: categoryService.getCategories, staleTime: 5 * 60_000 });
  const primary = (query.data ?? []).slice(0, 8);

  return (
    <div className="hidden border-t bg-white lg:block">
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-8 py-2">
        <Link
          href="/search"
          className="mr-2 inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100"
        >
          <Grid3X3 className="size-4" />
          {t("categories.title")}
          <ChevronDown className="size-3.5" />
        </Link>

        {primary.map((category) => (
          <Link
            key={category.id}
            href={`/search?category=${category.id}`}
            className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
          >
            {categoryName(category.id, category.name)}
          </Link>
        ))}

        <Link
          href="/search"
          className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
        >
          {t("categories.more")}
        </Link>
      </div>
    </div>
  );
}
