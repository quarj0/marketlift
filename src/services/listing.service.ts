import { listings, sellers } from "@/mocks/data";
import type { SearchFilters } from "@/types";
const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

export const listingService = {
  async getListings(filters: SearchFilters = {}) {
    await delay();
    let result = [...listings];
    if (filters.q) {
      const q = filters.q.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q),
      );
    }
    if (filters.category)
      result = result.filter((i) => i.category === filters.category);
    if (filters.state)
      result = result.filter((i) => i.location.stateCode === filters.state);
    if (filters.city)
      result = result.filter((i) => i.location.city === filters.city);
    if (filters.district)
      result = result.filter((i) =>
        i.location.district
          ?.toLowerCase()
          .includes(filters.district!.toLowerCase()),
      );
    if (filters.condition)
      result = result.filter((i) => i.condition === filters.condition);
    if (filters.sellerType) {
      const ids = new Set(
        sellers
          .filter((s) => (s.type ?? "individual") === filters.sellerType)
          .map((s) => s.id),
      );
      result = result.filter((i) => ids.has(i.sellerId));
    }
    if (filters.verifiedOnly) {
      const ids = new Set(sellers.filter((s) => s.verified).map((s) => s.id));
      result = result.filter((i) => ids.has(i.sellerId));
    }
    if (filters.minPrice !== undefined)
      result = result.filter((i) => i.price >= filters.minPrice!);
    if (filters.maxPrice !== undefined)
      result = result.filter((i) => i.price <= filters.maxPrice!);
    if (filters.dateListed) {
      const days =
        filters.dateListed === "today"
          ? 1
          : filters.dateListed === "week"
            ? 7
            : 30;
      const cutoff = Date.now() - days * 86400000;
      result = result.filter((i) => +new Date(i.createdAt) >= cutoff);
    }
    if (filters.sort === "price_asc") result.sort((a, b) => a.price - b.price);
    if (filters.sort === "price_desc") result.sort((a, b) => b.price - a.price);
    if (filters.sort === "newest")
      result.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (!filters.sort || filters.sort === "relevant")
      result.sort(
        (a, b) => Number(b.featured) - Number(a.featured) || b.views - a.views,
      );
    return result;
  },
  async getListing(slug: string) {
    await delay();
    return listings.find((i) => i.slug === slug || i.id === slug) ?? null;
  },
  async getSimilar(slug: string, limit = 4) {
    await delay(120);
    const source = listings.find((i) => i.slug === slug || i.id === slug);
    return source
      ? listings
          .filter((i) => i.id !== source.id && i.category === source.category)
          .slice(0, limit)
      : [];
  },
  async getFeatured() {
    await delay(120);
    return listings.filter((i) => i.featured);
  },
  async getRecent(limit = 8) {
    await delay(140);
    return [...listings]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, limit);
  },
  async getNearby(stateCode = "SP", limit = 8) {
    await delay(160);
    const nearby = listings.filter((i) => i.location.stateCode === stateCode);
    return (nearby.length ? nearby : listings).slice(0, limit);
  },
};
