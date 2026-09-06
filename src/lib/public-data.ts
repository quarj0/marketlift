import "server-only";
import { cacheLife } from "next/cache";
import { categoryService } from "@/services/category.service";
import { marketplaceService } from "@/services/marketplace.service";
import { listingService } from "@/services/listing.service";

export async function publicCategories() {
  "use cache";
  cacheLife({ stale: 300, revalidate: 300, expire: 3600 });
  try {
    return await categoryService.getCategories();
  } catch {
    cacheLife({ stale: 0, revalidate: 5, expire: 300 });
    return null;
  }
}
export async function publicHomeFeed(countryCode: string) {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 300 });
  try {
    return await marketplaceService.getHomeFeed(countryCode);
  } catch {
    cacheLife({ stale: 0, revalidate: 5, expire: 300 });
    return null;
  }
}
export async function publicListing(slug: string) {
  "use cache";
  cacheLife({ stale: 15, revalidate: 30, expire: 120 });
  return listingService.getListing(slug);
}
