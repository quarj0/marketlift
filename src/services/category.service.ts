import { categories, categoryConfigurations, getCategoryConfiguration } from '@/mocks/category-config';
import type { CategoryConfiguration } from '@/types';

const delay = (ms = 140) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Frontend boundary for category metadata.
 * Replace these mock implementations with Django REST/GraphQL calls later;
 * components should continue consuming the same CategoryConfiguration shape.
 */
export const categoryService = {
  async getCategories() {
    await delay();
    return categories;
  },

  async getConfiguration(categoryId: string): Promise<CategoryConfiguration | null> {
    await delay();
    return getCategoryConfiguration(categoryId);
  },

  async getConfigurations(): Promise<CategoryConfiguration[]> {
    await delay();
    return categoryConfigurations;
  },
};
