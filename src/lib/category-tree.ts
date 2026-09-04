import type { Category } from "@/types";

export type CategoryTreeEntry = {
  category: Category;
  depth: number;
  path: Category[];
};

export function flattenCategories(
  categories: Category[],
  depth = 0,
  parents: Category[] = [],
): CategoryTreeEntry[] {
  return categories.flatMap((category) => {
    const path = [...parents, category];
    return [
      { category, depth, path },
      ...flattenCategories(category.subcategories ?? [], depth + 1, path),
    ];
  });
}

export function findCategoryPath(categories: Category[], slug: string) {
  return flattenCategories(categories).find(
    ({ category }) => category.id === slug,
  )?.path;
}
