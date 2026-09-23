import type { Category } from "@/types";

export const MIN_LISTING_PHOTOS = 3;
export const DEFAULT_MAX_LISTING_PHOTOS = 6;

function rootForCategory(categories: Category[], categoryId: string): Category | undefined {
  for (const root of categories) {
    if (root.id === categoryId) return root;
    const stack = [...(root.subcategories ?? [])];
    while (stack.length) {
      const item = stack.pop()!;
      if (item.id === categoryId) return root;
      stack.push(...(item.subcategories ?? []));
    }
  }
  return undefined;
}

export function maxListingPhotos(categories: Category[], categoryId: string): number {
  const root = rootForCategory(categories, categoryId);
  if (root?.id === "vehicles") return 10;
  if (root?.id === "properties" || root?.id === "property") return 7;
  return DEFAULT_MAX_LISTING_PHOTOS;
}
