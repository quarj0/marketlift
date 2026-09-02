"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight, Grid3X3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import {
  CategoryIcon,
  resolveCategoryVisual,
} from "@/components/categories/category-visual";
import { categoryService } from "@/services/category.service";
import { useLocale } from "@/providers/locale-provider";

export function CategoryNav() {
  const { t, categoryName } = useLocale();
  const query = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getCategories,
    staleTime: 5 * 60_000,
  });
  const categories = query.data ?? [];
  const primary = categories.slice(0, 8);

  return (
    <div className="hidden border-t bg-white lg:block">
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-visible px-8 py-2">
        <div className="group relative mr-2 shrink-0">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100"
          >
            <Grid3X3 className="size-4" />
            {t("categories.title")}
            <ChevronDown className="size-3.5" />
          </Link>

          {categories.length > 0 && (
            <div className="invisible absolute left-0 top-full z-50 w-190 translate-y-1 rounded-2xl border border-slate-200 bg-white p-4 opacity-0 shadow-2xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <div className="grid grid-cols-3 gap-3">
                {categories.map((category) => {
                  const children = (category.subcategories ?? []).filter(
                    (item) => item.active !== false,
                  );
                  return (
                    <div
                      key={category.id}
                      className="rounded-xl border border-slate-100 p-3"
                    >
                      <Link
                        href={`/search?category=${category.id}`}
                        className="flex items-center justify-between gap-3 text-sm font-black text-slate-900 hover:text-brand-700"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className={`grid size-8 shrink-0 place-items-center rounded-lg ${resolveCategoryVisual(category).tone}`}
                          >
                            <CategoryIcon category={category} className="size-4" />
                          </span>
                          <span className="truncate">
                            {categoryName(category.id, category.name)}
                          </span>
                        </span>
                        <ChevronRight className="size-3.5 shrink-0" />
                      </Link>
                      {children.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {children.slice(0, 7).map((sub) => (
                            <Link
                              key={sub.id}
                              href={`/search?category=${sub.id}`}
                              className="flex items-center gap-2 rounded-md px-1 py-1.5 text-xs text-slate-500 hover:bg-brand-50 hover:text-brand-700"
                            >
                              <CategoryIcon category={sub} className="size-3.5 shrink-0" />
                              <span>{categoryName(sub.id, sub.name)}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {primary.map((category) => {
          const children = (category.subcategories ?? []).filter(
            (item) => item.active !== false,
          );

          return (
            <div key={category.id} className="group relative shrink-0">
              <Link
                href={`/search?category=${category.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
              >
                <CategoryIcon category={category} className="size-3.5 shrink-0" />
                {categoryName(category.id, category.name)}
                {children.length > 0 && <ChevronDown className="size-3.5" />}
              </Link>

              {children.length > 0 && (
                <div className="invisible absolute left-0 top-full z-50 min-w-64 translate-y-1 rounded-xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <Link
                    href={`/search?category=${category.id}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-black text-slate-900 hover:bg-slate-50"
                  >
                    All {categoryName(category.id, category.name)}
                    <ChevronRight className="size-3.5" />
                  </Link>
                  <div className="my-1 border-t border-slate-100" />
                  {children.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/search?category=${sub.id}`}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-brand-50 hover:text-brand-700"
                    >
                      <CategoryIcon category={sub} className="size-4 shrink-0" />
                      <span>{categoryName(sub.id, sub.name)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}

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
