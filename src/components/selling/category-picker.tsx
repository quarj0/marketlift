"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { CategoryIcon, resolveCategoryVisual } from "@/components/categories/category-visual";
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
  const visible = path.length ? path[path.length - 1]?.subcategories || [] : categories;

  const breadcrumbs = useMemo(
    () => path.map((item) => categoryName(item.id, item.name)),
    [categoryName, path],
  );

  function choose(category: Category) {
    if (category.subcategories?.length) {
      setPath((current) => [...current, category]);
      return;
    }
    onSelect(category.id);
  }

  return (
    <div className="mt-5">
      {path.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPath((current) => current.slice(0, -1))}
            className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <ChevronLeft className="size-4" />
            Back
          </button>
          <p className="min-w-0 text-sm text-slate-500">{breadcrumbs.join(" / ")}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {visible.map((category) => {
          const hasChildren = Boolean(category.subcategories?.length);
          const visual = resolveCategoryVisual(category);
          const selected = selectedId === category.id;

          return (
            <button
              type="button"
              key={category.id}
              aria-pressed={!hasChildren ? selected : undefined}
              onClick={() => choose(category)}
              className={`group min-h-28 overflow-hidden rounded-2xl border text-left transition ${
                selected
                  ? "border-brand-500 bg-brand-50 text-brand-900"
                  : "bg-white hover:border-brand-300 hover:bg-slate-50"
              }`}
            >
              <div className="relative h-20 overflow-hidden bg-slate-100">
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 45vw, 220px"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className={`grid h-full place-items-center ${visual.tone}`}>
                    <CategoryIcon category={category} className="size-7" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <span className="line-clamp-2 text-sm font-bold">
                  {categoryName(category.id, category.name)}
                </span>
                {hasChildren && <ChevronRight className="size-4 shrink-0 text-slate-400" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
