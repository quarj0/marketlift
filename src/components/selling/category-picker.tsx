"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import {
  CategoryIcon,
  resolveCategoryVisual,
} from "@/components/categories/category-visual";
import type { Category } from "@/types";

type Props = {
  categories: Category[];
  selectedId?: string;
  onSelect: (categoryId: string) => void;
  categoryName: (id: string, name: string) => string;
};

export function CategoryPicker({
  categories,
  selectedId,
  onSelect,
  categoryName,
}: Props) {
  const [path, setPath] = useState<Category[]>([]);

  const current = path.at(-1);
  const visible = current?.subcategories || categories;
  const isRoot = path.length === 0;

  const breadcrumbs = useMemo(
    () => path.map((item) => categoryName(item.id, item.name)),
    [categoryName, path],
  );

  function choose(category: Category) {
    if (category.subcategories?.length) {
      setPath((currentPath) => [...currentPath, category]);
      return;
    }

    onSelect(category.id);
  }

  function goBack() {
    setPath((currentPath) => currentPath.slice(0, -1));
  }

  return (
    <div className="mt-5">
      {path.length > 0 && (
        <div className="mb-4 flex min-w-0 items-center gap-3 border-b border-slate-100 pb-4">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ChevronLeft className="size-4" />
            Back
          </button>

          <div className="min-w-0">
            <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-400">
              {breadcrumbs.slice(0, -1).join(" / ") || "Category"}
            </p>
            <p className="truncate text-sm font-bold text-slate-900">
              {breadcrumbs.at(-1)}
            </p>
          </div>
        </div>
      )}

      <div
        className={
          isRoot
            ? "grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3"
            : "grid grid-cols-1 gap-2 sm:grid-cols-2"
        }
      >
        {visible.map((category) => {
          const hasChildren = Boolean(category.subcategories?.length);
          const childCount = category.subcategories?.length || 0;
          const selected = selectedId === category.id;
          const visual = resolveCategoryVisual(category);

          return (
            <button
              type="button"
              key={category.id}
              aria-pressed={!hasChildren ? selected : undefined}
              onClick={() => choose(category)}
              className={`group flex min-h-[72px] items-center gap-3 rounded-xl border p-3 text-left transition ${
                selected
                  ? "border-brand-500 bg-brand-50 ring-1 ring-brand-100"
                  : "border-slate-200 bg-white hover:border-brand-300 hover:bg-slate-50"
              }`}
            >
              <div
                className={`relative grid size-12 shrink-0 overflow-hidden rounded-lg ${
                  category.imageUrl ? "bg-slate-100" : visual.tone
                }`}
              >
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <CategoryIcon
                    category={category}
                    className="m-auto size-5"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`line-clamp-2 text-sm font-bold leading-snug ${
                    selected ? "text-brand-900" : "text-slate-900"
                  }`}
                >
                  {categoryName(category.id, category.name)}
                </p>

                {hasChildren && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {childCount} {childCount === 1 ? "option" : "options"}
                  </p>
                )}
              </div>

              {hasChildren && (
                <ChevronRight className="size-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
              )}
            </button>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
          <p className="text-sm font-semibold text-slate-700">
            No categories available
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Go back and choose another category.
          </p>
        </div>
      )}
    </div>
  );
}
